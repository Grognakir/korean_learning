import "server-only";

import { unstable_cache } from "next/cache";

import { createServiceRoleSupabaseClient } from "@/lib/supabase/serviceRoleClient";

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

async function loadPublishedCatalogSnapshot(): Promise<{
  units: PublicUnitSummary[];
  grammarTopics: PublicGrammarTopicSummary[];
  aggregates: {
    units: number;
    grammarTopics: number;
    dictionaryEntries: number;
    readingPassages: number;
    approvedExercises: number;
  };
}> {
  // Public catalog reads run inside `"use cache"` / `unstable_cache`; cookie-bound
  // server clients are unavailable there, so use the service-role client (same as modules).
  const supabase = createServiceRoleSupabaseClient();

  const [modulesResult, topicsResult, dictResult, passagesResult, exercisesResult] =
    await Promise.all([
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
      supabase
        .from("dictionary_entries")
        .select("id", { count: "exact", head: true })
        .eq("status", "published"),
      supabase
        .from("reading_passages")
        .select("id", { count: "exact", head: true })
        .eq("status", "published"),
      supabase
        .from("exercises")
        .select("id, module_id", { count: "exact" })
        .eq("status", "approved"),
    ]);

  if (modulesResult.error) throw modulesResult.error;
  if (topicsResult.error) throw topicsResult.error;
  if (dictResult.error) throw dictResult.error;
  if (passagesResult.error) throw passagesResult.error;
  if (exercisesResult.error) throw exercisesResult.error;

  const modules = (modulesResult.data ?? []) as ModuleRow[];
  const topics = (topicsResult.data ?? []) as TopicRow[];
  const moduleById = new Map(modules.map((module) => [module.id, module]));

  const exerciseCountByModule = new Map<string, number>();
  for (const exercise of exercisesResult.data ?? []) {
    const moduleId = (exercise as { module_id: string }).module_id;
    exerciseCountByModule.set(moduleId, (exerciseCountByModule.get(moduleId) ?? 0) + 1);
  }

  const grammarCountByModule = new Map<string, number>();
  for (const topic of topics) {
    grammarCountByModule.set(topic.module_id, (grammarCountByModule.get(topic.module_id) ?? 0) + 1);
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
      dictionaryEntries: 0,
      readingPassages: 0,
      approvedExercises: exerciseCountByModule.get(module.id) ?? 0,
    },
  }));

  // One aggregated dictionary/passage count query already done; per-unit links optional later.
  const dictionaryTotal = dictResult.count ?? 0;
  const passageTotal = passagesResult.count ?? 0;

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
      approvedExercises: exercisesResult.count ?? 0,
    },
  };
}

const getCachedSnapshot = unstable_cache(loadPublishedCatalogSnapshot, ["curriculum-catalog"], {
  tags: ["curriculum-catalog", "learning-modules"],
  revalidate: 3600,
});

export class SupabaseCatalogRepository implements CatalogRepository {
  async listUnits(): Promise<CatalogListResult<PublicUnitSummary>> {
    const snapshot = await getCachedSnapshot();
    if (snapshot.units.length === 0) {
      return { status: "empty", items: [] };
    }
    return { status: "ready", items: snapshot.units };
  }

  async getUnitBySlug(slug: string): Promise<PublicUnitSummary | undefined> {
    const snapshot = await getCachedSnapshot();
    return snapshot.units.find((unit) => unit.slug === slug);
  }

  async listGrammarTopics(
    query: CatalogQuery = {},
  ): Promise<CatalogListResult<PublicGrammarTopicSummary>> {
    const snapshot = await getCachedSnapshot();

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
    const snapshot = await getCachedSnapshot();
    return snapshot.aggregates;
  }
}
