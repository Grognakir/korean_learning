import "server-only";

import {
  createServiceRoleSupabaseClient,
  type ServiceRoleSupabaseClient,
} from "@/lib/supabase/serviceRoleClient";
import { CurriculumContentError } from "@/modules/curriculum/CurriculumContentError";

import type {
  DictionaryPageResult,
  DictionaryQuery,
  DictionaryRepository,
} from "./DictionaryRepository";
import type { PublicDictionaryEntry } from "../domain/types";

const DEFAULT_PAGE_SIZE = 20;

export async function loadPublishedDictionary(
  supabase: ServiceRoleSupabaseClient = createServiceRoleSupabaseClient(),
): Promise<readonly PublicDictionaryEntry[]> {
  let results;
  try {
    results = await Promise.all([
      supabase
        .from("dictionary_entries")
        .select(
          "id, logical_id, lemma_ko, sense_key, meanings_ru, transliteration, part_of_speech, level, content_version",
        )
        .eq("status", "published")
        .order("lemma_ko", { ascending: true }),
      supabase.from("dictionary_entry_modules").select("entry_id, module_id, sort_order"),
      supabase.from("learning_modules").select("id, slug").eq("status", "published"),
    ]);
  } catch (error) {
    throw new CurriculumContentError("Dictionary query failed", error);
  }

  const [entriesResult, linksResult, modulesResult] = results;
  const queryError = entriesResult.error ?? linksResult.error ?? modulesResult.error;
  if (queryError) throw new CurriculumContentError("Dictionary query failed", queryError);

  const moduleSlugById = new Map(
    (modulesResult.data ?? []).map((module) => [module.id, module.slug]),
  );
  const unitSlugsByEntryId = new Map<string, string[]>();
  for (const link of linksResult.data ?? []) {
    const unitSlug = moduleSlugById.get(link.module_id);
    if (!unitSlug) continue;

    const unitSlugs = unitSlugsByEntryId.get(link.entry_id) ?? [];
    unitSlugs.push(unitSlug);
    unitSlugsByEntryId.set(link.entry_id, unitSlugs);
  }

  return (entriesResult.data ?? [])
    .flatMap((row) => {
      const unitSlugs = unitSlugsByEntryId.get(row.id);
      if (!unitSlugs || unitSlugs.length === 0) return [];

      const meanings = Array.isArray(row.meanings_ru) ? row.meanings_ru : [];
      const firstMeaning = typeof meanings[0] === "string" ? meanings[0] : row.lemma_ko;
      return [
        {
          id: row.id,
          logicalId: row.logical_id,
          lemma: row.lemma_ko,
          senseKey: row.sense_key,
          gloss: { ko: row.lemma_ko, ru: String(firstMeaning) },
          transliteration: row.transliteration,
          pos: row.part_of_speech,
          level: row.level,
          unitSlugs,
          contentVersion: row.content_version as PublicDictionaryEntry["contentVersion"],
          language: { lemma: "ko" as const, gloss: "ru" as const },
        },
      ];
    })
    .sort((left, right) => {
      const byLemma = left.lemma.localeCompare(right.lemma, "ko");
      return byLemma !== 0 ? byLemma : left.senseKey.localeCompare(right.senseKey);
    });
}

function paginate(
  items: readonly PublicDictionaryEntry[],
  query: DictionaryQuery,
): DictionaryPageResult {
  let filtered = items;
  if (query.lemma) {
    filtered = filtered.filter((entry) => entry.lemma === query.lemma);
  }
  if (query.unitSlug) {
    filtered = filtered.filter((entry) => entry.unitSlugs.includes(query.unitSlug!));
  }

  const posOptions = [
    ...new Set(
      filtered.map((entry) => entry.pos).filter((value): value is string => Boolean(value)),
    ),
  ].sort((left, right) => left.localeCompare(right));

  if (query.pos) {
    filtered = filtered.filter((entry) => entry.pos === query.pos);
  }

  const sorted = [...filtered].sort((left, right) => {
    const byLemma = left.lemma.localeCompare(right.lemma, "ko");
    return byLemma !== 0 ? byLemma : left.senseKey.localeCompare(right.senseKey);
  });

  const lemmaCounts = new Map<string, number>();
  for (const entry of sorted) {
    lemmaCounts.set(entry.lemma, (lemmaCounts.get(entry.lemma) ?? 0) + 1);
  }
  const homonymLemmas = [...lemmaCounts.entries()]
    .filter(([, count]) => count > 1)
    .map(([lemma]) => lemma);

  const pageSize = Math.max(1, query.pageSize ?? DEFAULT_PAGE_SIZE);
  const total = sorted.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize) || 1);
  const page = Math.min(Math.max(1, query.page ?? 1), totalPages);
  const start = (page - 1) * pageSize;

  return {
    items: sorted.slice(start, start + pageSize),
    total,
    page,
    pageSize,
    posOptions,
    homonymLemmas,
  };
}

export class SupabaseDictionaryRepository implements DictionaryRepository {
  async list(query: DictionaryQuery = {}): Promise<readonly PublicDictionaryEntry[]> {
    const page = await this.listPage({ ...query, page: 1, pageSize: Number.MAX_SAFE_INTEGER });
    return page.items;
  }

  async listPage(query: DictionaryQuery = {}): Promise<DictionaryPageResult> {
    return paginate(await loadPublishedDictionary(), query);
  }

  async getByLogicalId(logicalId: string): Promise<PublicDictionaryEntry | undefined> {
    const items = await this.list();
    return items.find((entry) => entry.logicalId === logicalId);
  }
}
