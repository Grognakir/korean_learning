import "server-only";

import {
  createServiceRoleSupabaseClient,
  type ServiceRoleSupabaseClient,
} from "@/lib/supabase/serviceRoleClient";
import { CurriculumContentError } from "@/modules/curriculum/CurriculumContentError";

import type { CatalogRepository } from "./CatalogRepository";
import type {
  CatalogListResult,
  CatalogQuery,
  PublicGrammarTopicSummary,
  PublicUnitSummary,
} from "../domain/types";

type ModuleRow = {
  id: string;
  slug: string;
  unit_number: number | null;
  title_ko: string;
  title_ru: string;
  description_ru: string;
  content_version: string;
};

type TopicRow = {
  id: string;
  logical_id: string;
  module_id: string;
  pattern_ko: string;
  category: string;
  usage_key: string | null;
  title: string;
  summary_ru: string;
  content_version: string;
  rule_payload: { titleKo?: string; summaryKo?: string } | null;
};

type PublishedCatalogSnapshot = {
  units: PublicUnitSummary[];
  grammarTopics: PublicGrammarTopicSummary[];
  aggregates: {
    units: number;
    grammarTopics: number;
    dictionaryEntries: number;
    readingPassages: number;
    approvedExercises: number;
  };
};

export async function loadPublishedCatalogSnapshot(
  supabase: ServiceRoleSupabaseClient = createServiceRoleSupabaseClient(),
): Promise<PublishedCatalogSnapshot> {
  let results;
  try {
    results = await Promise.all([
      supabase
        .from("learning_modules")
        .select("id, slug, unit_number, title_ko, title_ru, description_ru, content_version")
        .eq("status", "published")
        .eq("level", "1급")
        .not("unit_number", "is", null)
        .order("unit_number", { ascending: true }),
      supabase
        .from("grammar_topics")
        .select(
          "id, logical_id, module_id, pattern_ko, category, usage_key, title, summary_ru, content_version, rule_payload",
        )
        .eq("status", "published")
        .order("sort_order", { ascending: true }),
      supabase.from("dictionary_entries").select("id").eq("status", "published"),
      supabase.from("dictionary_entry_modules").select("entry_id, module_id"),
      supabase.from("reading_passages").select("id, primary_module_id").eq("status", "published"),
      supabase
        .from("exercises")
        .select("id, module_id", { count: "exact" })
        .eq("status", "approved"),
    ]);
  } catch (error) {
    throw new CurriculumContentError("Catalog query failed", error);
  }

  const [
    modulesResult,
    topicsResult,
    dictionaryEntriesResult,
    dictionaryLinksResult,
    passagesResult,
    exercisesResult,
  ] = results;
  const queryError =
    modulesResult.error ??
    topicsResult.error ??
    dictionaryEntriesResult.error ??
    dictionaryLinksResult.error ??
    passagesResult.error ??
    exercisesResult.error;
  if (queryError) throw new CurriculumContentError("Catalog query failed", queryError);

  const modules = (modulesResult.data ?? []) as ModuleRow[];
  const topics = (topicsResult.data ?? []) as TopicRow[];
  const moduleById = new Map(modules.map((module) => [module.id, module]));
  const publishedDictionaryEntryIds = new Set(
    (dictionaryEntriesResult.data ?? []).map((entry) => entry.id),
  );

  const exerciseCountByModule = new Map<string, number>();
  for (const exercise of exercisesResult.data ?? []) {
    const moduleId = (exercise as { module_id: string }).module_id;
    if (!moduleById.has(moduleId)) continue;
    exerciseCountByModule.set(moduleId, (exerciseCountByModule.get(moduleId) ?? 0) + 1);
  }

  const grammarCountByModule = new Map<string, number>();
  for (const topic of topics) {
    grammarCountByModule.set(topic.module_id, (grammarCountByModule.get(topic.module_id) ?? 0) + 1);
  }

  const dictionaryCountByModule = new Map<string, number>();
  const publicDictionaryEntryIds = new Set<string>();
  for (const link of dictionaryLinksResult.data ?? []) {
    if (!publishedDictionaryEntryIds.has(link.entry_id) || !moduleById.has(link.module_id)) {
      continue;
    }
    publicDictionaryEntryIds.add(link.entry_id);
    dictionaryCountByModule.set(
      link.module_id,
      (dictionaryCountByModule.get(link.module_id) ?? 0) + 1,
    );
  }

  const passageCountByModule = new Map<string, number>();
  for (const passage of passagesResult.data ?? []) {
    if (!moduleById.has(passage.primary_module_id)) continue;
    passageCountByModule.set(
      passage.primary_module_id,
      (passageCountByModule.get(passage.primary_module_id) ?? 0) + 1,
    );
  }

  const units: PublicUnitSummary[] = modules.map((module) => ({
    id: module.id,
    logicalId: `unit.${module.slug}`,
    slug: module.slug,
    unitNumber: module.unit_number ?? 0,
    title: { ko: module.title_ko, ru: module.title_ru },
    summary: { ko: module.title_ko, ru: module.description_ru },
    level: "1급",
    contentVersion: module.content_version as PublicUnitSummary["contentVersion"],
    counts: {
      grammarTopics: grammarCountByModule.get(module.id) ?? 0,
      dictionaryEntries: dictionaryCountByModule.get(module.id) ?? 0,
      readingPassages: passageCountByModule.get(module.id) ?? 0,
      approvedExercises: exerciseCountByModule.get(module.id) ?? 0,
    },
  }));

  const dictionaryTotal = publicDictionaryEntryIds.size;
  const passageTotal = [...passageCountByModule.values()].reduce(
    (total, count) => total + count,
    0,
  );
  const exerciseTotal = [...exerciseCountByModule.values()].reduce(
    (total, count) => total + count,
    0,
  );

  const grammarTopics: PublicGrammarTopicSummary[] = topics.flatMap((topic) => {
    const learningModule = moduleById.get(topic.module_id);
    if (!learningModule || learningModule.unit_number == null) {
      return [];
    }
    const payload = topic.rule_payload ?? {};
    return [
      {
        id: topic.id,
        logicalId: topic.logical_id,
        unitLogicalId: `unit.${learningModule.slug}`,
        unitSlug: learningModule.slug,
        unitNumber: learningModule.unit_number,
        patternKo: topic.pattern_ko,
        category: topic.category,
        usageKey: topic.usage_key,
        title: { ko: payload.titleKo ?? topic.pattern_ko, ru: topic.title },
        summary: { ko: payload.summaryKo ?? topic.pattern_ko, ru: topic.summary_ru },
        contentVersion: topic.content_version as PublicGrammarTopicSummary["contentVersion"],
        language: { pattern: "ko", summary: "ru" },
      },
    ];
  });

  return {
    units,
    grammarTopics,
    aggregates: {
      units: units.length,
      grammarTopics: grammarTopics.length,
      dictionaryEntries: dictionaryTotal,
      readingPassages: passageTotal,
      approvedExercises: exerciseTotal,
    },
  };
}

export class SupabaseCatalogRepository implements CatalogRepository {
  #inFlight: Promise<PublishedCatalogSnapshot> | undefined;

  async #getSnapshot(): Promise<PublishedCatalogSnapshot> {
    const promise = this.#inFlight ?? loadPublishedCatalogSnapshot();
    this.#inFlight = promise;

    try {
      return await promise;
    } finally {
      if (this.#inFlight === promise) this.#inFlight = undefined;
    }
  }

  async listUnits(): Promise<CatalogListResult<PublicUnitSummary>> {
    const snapshot = await this.#getSnapshot();
    if (snapshot.units.length === 0) {
      return { status: "empty", items: [] };
    }
    return { status: "ready", items: snapshot.units };
  }

  async getUnitBySlug(slug: string): Promise<PublicUnitSummary | undefined> {
    const snapshot = await this.#getSnapshot();
    return snapshot.units.find((unit) => unit.slug === slug);
  }

  async listGrammarTopics(
    query: CatalogQuery = {},
  ): Promise<CatalogListResult<PublicGrammarTopicSummary>> {
    const snapshot = await this.#getSnapshot();

    if (query.unitSlug && !snapshot.units.some((unit) => unit.slug === query.unitSlug)) {
      return { status: "not_found" };
    }

    let items = snapshot.grammarTopics;
    if (query.unitSlug) {
      items = items.filter((topic) => topic.unitSlug === query.unitSlug);
    }
    if (query.grammarTopicId) {
      items = items.filter(
        (topic) => topic.id === query.grammarTopicId || topic.logicalId === query.grammarTopicId,
      );
      if (items.length === 0) {
        return { status: "not_found" };
      }
    }

    if (items.length === 0) {
      return { status: "empty", items: [] };
    }

    return { status: "ready", items };
  }

  async getGrammarTopicByLogicalId(
    logicalId: string,
  ): Promise<PublicGrammarTopicSummary | undefined> {
    const result = await this.listGrammarTopics({ grammarTopicId: logicalId });
    return result.status === "ready" ? result.items[0] : undefined;
  }

  async aggregateCounts() {
    const snapshot = await this.#getSnapshot();
    return snapshot.aggregates;
  }
}
