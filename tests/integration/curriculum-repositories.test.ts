import { describe, expect, it } from "vitest";

import { assertPublicCurriculumShape } from "@/features/catalog/data/assertPublicCatalogShape";
import { LocalCatalogRepository } from "@/features/catalog/data/LocalCatalogRepository";
import { loadPublishedCatalogSnapshot } from "@/features/catalog/data/SupabaseCatalogRepository";
import { LocalDictionaryRepository } from "@/features/dictionary/data/LocalDictionaryRepository";
import { loadPublishedDictionary } from "@/features/dictionary/data/SupabaseDictionaryRepository";
import { LocalReadingRepository } from "@/features/reading/data/LocalReadingRepository";
import { loadPublishedReadingBundle } from "@/features/reading/data/SupabaseReadingRepository";
import type { ServiceRoleSupabaseClient } from "@/lib/supabase/serviceRoleClient";
import { publishedCurriculumFixture } from "@/modules/curriculum/fixtures/publishedCurriculumFixture";

type QueryResult = {
  readonly data: readonly Record<string, unknown>[];
  readonly error: null;
  readonly count: number;
};

function createQueryBuilder(result: QueryResult) {
  const builder = {
    select: () => builder,
    eq: () => builder,
    not: () => builder,
    order: () => builder,
    then: <TResult1 = QueryResult, TResult2 = never>(
      onfulfilled?: ((value: QueryResult) => TResult1 | PromiseLike<TResult1>) | null,
      onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
    ) => Promise.resolve(result).then(onfulfilled, onrejected),
  };
  return builder;
}

function createSupabaseFixtureClient(): ServiceRoleSupabaseClient {
  const fixture = publishedCurriculumFixture;
  const unitByLogicalId = new Map(fixture.units.map((unit) => [unit.logicalId, unit]));
  const topicByLogicalId = new Map(fixture.grammarTopics.map((topic) => [topic.logicalId, topic]));
  const passageByLogicalId = new Map(
    fixture.readingPassages.map((passage) => [passage.logicalId, passage]),
  );

  const rowsByTable: Record<string, readonly Record<string, unknown>[]> = {
    learning_modules: fixture.units.map((unit) => ({
      id: unit.id,
      slug: unit.slug,
      unit_number: unit.unitNumber,
      title_ko: unit.titleKo,
      title_ru: unit.titleRu,
      description_ru: unit.summaryRu,
      content_version: unit.contentVersion,
      status: unit.status,
    })),
    grammar_topics: fixture.grammarTopics.map((topic) => ({
      id: topic.id,
      logical_id: topic.logicalId,
      module_id: unitByLogicalId.get(topic.unitLogicalId)?.id,
      pattern_ko: topic.patternKo,
      category: topic.category,
      usage_key: topic.usageKey,
      title: topic.titleRu,
      summary_ru: topic.summaryRu,
      content_version: topic.contentVersion,
      status: topic.status,
      rule_payload: { titleKo: topic.titleKo, summaryKo: topic.summaryKo },
    })),
    dictionary_entries: fixture.dictionaryEntries.map((entry) => ({
      id: entry.id,
      logical_id: entry.logicalId,
      lemma_ko: entry.lemma,
      sense_key: entry.senseKey,
      meanings_ru: [entry.glossRu],
      transliteration: entry.transliteration,
      part_of_speech: entry.pos,
      level: entry.level,
      content_version: entry.contentVersion,
      status: entry.status,
    })),
    dictionary_entry_modules: fixture.dictionaryEntries.flatMap((entry) =>
      entry.unitLogicalIds.map((unitLogicalId, sortOrder) => ({
        entry_id: entry.id,
        module_id: unitByLogicalId.get(unitLogicalId)?.id,
        sort_order: sortOrder,
      })),
    ),
    reading_passages: fixture.readingPassages.map((passage) => ({
      id: passage.id,
      logical_id: passage.logicalId,
      primary_module_id: unitByLogicalId.get(passage.unitLogicalId)?.id,
      title_ko: passage.titleKo,
      title_ru: passage.titleRu,
      body_ko: passage.bodyKo,
      content_version: passage.contentVersion,
      status: passage.status,
    })),
    exercises: fixture.exercises.map((exercise) => ({
      id: exercise.id,
      logical_id: exercise.logicalId,
      module_id: unitByLogicalId.get(exercise.unitLogicalId)?.id,
      learning_skill: exercise.skill,
      type: exercise.exerciseType,
      difficulty: exercise.difficulty,
      prompt_ko: exercise.promptKo,
      prompt_ru: exercise.promptRu,
      reading_passage_id: exercise.readingPassageLogicalId
        ? passageByLogicalId.get(exercise.readingPassageLogicalId)?.id
        : null,
      primary_topic_id: exercise.grammarTopicLogicalId
        ? topicByLogicalId.get(exercise.grammarTopicLogicalId)?.id
        : null,
      content_version: exercise.contentVersion,
      status: exercise.status,
    })),
    exercise_options_public: fixture.exercises.flatMap((exercise) =>
      exercise.options.map((option, sortOrder) => ({
        exercise_id: exercise.id,
        option_key: option.id,
        label_ko: option.labelKo,
        label_ru: option.labelRu,
        sort_order: sortOrder,
      })),
    ),
  };

  return {
    from: (table: string) => {
      const data = rowsByTable[table];
      if (!data) throw new Error(`Unexpected Supabase table: ${table}`);
      return createQueryBuilder({ data, error: null, count: data.length });
    },
  } as unknown as ServiceRoleSupabaseClient;
}

describe("curriculum Supabase repositories", () => {
  it("maps real Supabase-shaped rows to the public catalog DTO", async () => {
    const localRepository = new LocalCatalogRepository();
    const localUnits = await localRepository.listUnits();
    const snapshot = await loadPublishedCatalogSnapshot(createSupabaseFixtureClient());

    expect(localUnits.status).toBe("ready");
    if (localUnits.status !== "ready") throw new Error("Expected ready local fixture");

    expect(snapshot.units.map((unit) => unit.counts)).toEqual(
      localUnits.items.map((unit) => unit.counts),
    );
    expect(snapshot.aggregates).toEqual(await localRepository.aggregateCounts());
    expect(snapshot.grammarTopics.map((topic) => topic.logicalId)).toEqual([
      "grammar.u01.n01",
      "grammar.u02.n01",
    ]);
    assertPublicCurriculumShape(snapshot, "supabase catalog snapshot");
  });

  it("preserves dictionary-to-unit links used by filters", async () => {
    const localRepository = new LocalDictionaryRepository();
    const remoteItems = await loadPublishedDictionary(createSupabaseFixtureClient());
    const localItems = await localRepository.list();

    expect(remoteItems).toEqual(localItems);
    expect(remoteItems.filter((entry) => entry.unitSlugs.includes("u01"))).toHaveLength(2);
    assertPublicCurriculumShape(remoteItems, "supabase dictionary");
  });

  it("preserves grammar and passage links on Supabase exercises", async () => {
    const localRepository = new LocalReadingRepository();
    const remoteBundle = await loadPublishedReadingBundle(createSupabaseFixtureClient());
    const localExercises = await localRepository.listApprovedExercises();

    expect(remoteBundle.exercises).toEqual(localExercises);
    expect(
      remoteBundle.exercises.filter(
        (exercise) => exercise.grammarTopicLogicalId === "grammar.u01.n01",
      ),
    ).toHaveLength(2);
    expect(JSON.stringify(remoteBundle.exercises)).not.toContain("correctOptionId");
    assertPublicCurriculumShape(remoteBundle, "supabase reading bundle");
  });
});
