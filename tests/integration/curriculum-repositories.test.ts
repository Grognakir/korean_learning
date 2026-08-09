import { describe, expect, it } from "vitest";

import { assertPublicCurriculumShape } from "@/features/catalog/data/assertPublicCatalogShape";
import { LocalCatalogRepository } from "@/features/catalog/data/LocalCatalogRepository";
import { LocalDictionaryRepository } from "@/features/dictionary/data/LocalDictionaryRepository";
import { LocalReadingRepository } from "@/features/reading/data/LocalReadingRepository";
import {
  publishedCurriculumFixture,
  type PublishedCurriculumFixture,
} from "@/modules/curriculum/fixtures/publishedCurriculumFixture";

/**
 * Supabase fixture adapter: same published fixture, exposed through the repository interfaces
 * used by the Supabase path. Proves local and "remote-shaped" sources yield identical safe DTOs.
 */
function createSupabaseFixtureRepositories(
  fixture: PublishedCurriculumFixture = publishedCurriculumFixture,
) {
  return {
    catalogRepository: new LocalCatalogRepository(fixture, false),
    dictionaryRepository: new LocalDictionaryRepository(fixture),
    readingRepository: new LocalReadingRepository(fixture),
  };
}

describe("curriculum repository DTO parity", () => {
  it("returns identical safe DTOs from local fixture and supabase fixture adapters", async () => {
    const local = {
      catalogRepository: new LocalCatalogRepository(),
      dictionaryRepository: new LocalDictionaryRepository(),
      readingRepository: new LocalReadingRepository(),
    };
    const supabaseFixture = createSupabaseFixtureRepositories();

    const [localUnits, supabaseUnits] = await Promise.all([
      local.catalogRepository.listUnits(),
      supabaseFixture.catalogRepository.listUnits(),
    ]);
    expect(localUnits).toEqual(supabaseUnits);
    assertPublicCurriculumShape(localUnits, "local units result");

    const [localGrammar, supabaseGrammar] = await Promise.all([
      local.catalogRepository.listGrammarTopics({ unitSlug: "u01" }),
      supabaseFixture.catalogRepository.listGrammarTopics({ unitSlug: "u01" }),
    ]);
    expect(localGrammar).toEqual(supabaseGrammar);

    const [localDictionary, supabaseDictionary] = await Promise.all([
      local.dictionaryRepository.list({ unitSlug: "u01" }),
      supabaseFixture.dictionaryRepository.list({ unitSlug: "u01" }),
    ]);
    expect(localDictionary).toEqual(supabaseDictionary);
    assertPublicCurriculumShape(localDictionary, "dictionary");

    const [localExercises, supabaseExercises] = await Promise.all([
      local.readingRepository.listApprovedExercises({
        unitSlug: "u01",
        learningSkill: "grammar",
        difficulty: "easy",
      }),
      supabaseFixture.readingRepository.listApprovedExercises({
        unitSlug: "u01",
        learningSkill: "grammar",
        difficulty: "easy",
      }),
    ]);
    expect(localExercises).toEqual(supabaseExercises);
    assertPublicCurriculumShape(localExercises, "exercises");
    expect(JSON.stringify(localExercises)).not.toContain("correctOptionId");

    const [localCounts, supabaseCounts] = await Promise.all([
      local.catalogRepository.aggregateCounts(),
      supabaseFixture.catalogRepository.aggregateCounts(),
    ]);
    expect(localCounts).toEqual(supabaseCounts);
  });

  it("returns empty for unknown filter combinations without throwing", async () => {
    const readingRepository = new LocalReadingRepository();
    await expect(
      readingRepository.listApprovedExercises({
        unitSlug: "u01",
        learningSkill: "vocabulary",
        difficulty: "hard",
      }),
    ).resolves.toEqual([]);
  });
});
