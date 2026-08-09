import "server-only";

import { unstable_cache } from "next/cache";

import { createServiceRoleSupabaseClient } from "@/lib/supabase/serviceRoleClient";

import type {
  DictionaryPageResult,
  DictionaryQuery,
  DictionaryRepository,
} from "./DictionaryRepository";
import type { PublicDictionaryEntry } from "../domain/types";

const DEFAULT_PAGE_SIZE = 20;

async function loadPublishedDictionary(): Promise<readonly PublicDictionaryEntry[]> {
  const supabase = createServiceRoleSupabaseClient();
  const { data, error } = await supabase
    .from("dictionary_entries")
    .select(
      "id, logical_id, lemma_ko, sense_key, meanings_ru, transliteration, part_of_speech, level, content_version",
    )
    .eq("status", "published")
    .order("lemma_ko", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) => {
    const meanings = Array.isArray(row.meanings_ru) ? row.meanings_ru : [];
    const firstMeaning = typeof meanings[0] === "string" ? meanings[0] : row.lemma_ko;
    return {
      id: row.id,
      logicalId: row.logical_id,
      lemma: row.lemma_ko,
      senseKey: row.sense_key,
      gloss: { ko: row.lemma_ko, ru: String(firstMeaning) },
      transliteration: row.transliteration,
      pos: row.part_of_speech,
      level: row.level,
      unitSlugs: [] as string[],
      contentVersion: row.content_version as PublicDictionaryEntry["contentVersion"],
      language: { lemma: "ko" as const, gloss: "ru" as const },
    };
  });
}

const getCachedDictionary = unstable_cache(loadPublishedDictionary, ["curriculum-dictionary"], {
  tags: ["curriculum-dictionary"],
  revalidate: 3600,
});

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
    return paginate(await getCachedDictionary(), query);
  }

  async getByLogicalId(logicalId: string): Promise<PublicDictionaryEntry | undefined> {
    const items = await this.list();
    return items.find((entry) => entry.logicalId === logicalId);
  }
}
