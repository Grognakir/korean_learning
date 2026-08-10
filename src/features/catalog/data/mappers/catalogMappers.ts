import type {
  CatalogContentCounts,
  PublicGrammarTopicSummary,
  PublicUnitSummary,
} from "../../domain/types";
import type {
  FixtureGrammarTopic,
  FixtureUnit,
  PublishedCurriculumFixture,
} from "@/modules/curriculum/fixtures/publishedCurriculumFixture";

function countsForUnit(
  fixture: PublishedCurriculumFixture,
  unitLogicalId: string,
): CatalogContentCounts {
  return {
    grammarTopics: fixture.grammarTopics.filter((topic) => topic.unitLogicalId === unitLogicalId)
      .length,
    dictionaryEntries: fixture.dictionaryEntries.filter((entry) =>
      entry.unitLogicalIds.includes(unitLogicalId),
    ).length,
    readingPassages: fixture.readingPassages.filter(
      (passage) => passage.unitLogicalId === unitLogicalId,
    ).length,
    approvedExercises: fixture.exercises.filter(
      (exercise) => exercise.unitLogicalId === unitLogicalId && exercise.status === "approved",
    ).length,
  };
}

export function mapFixtureUnitToPublic(
  unit: FixtureUnit,
  fixture: PublishedCurriculumFixture,
): PublicUnitSummary {
  return {
    id: unit.id,
    logicalId: unit.logicalId,
    slug: unit.slug,
    unitNumber: unit.unitNumber,
    title: { ko: unit.titleKo, ru: unit.titleRu },
    summary: { ko: unit.summaryKo, ru: unit.summaryRu },
    level: "1급",
    contentVersion: unit.contentVersion,
    counts: countsForUnit(fixture, unit.logicalId),
  };
}

export function mapFixtureGrammarToPublic(
  topic: FixtureGrammarTopic,
  unitSlug: string,
  unitNumber: number,
): PublicGrammarTopicSummary {
  return {
    id: topic.id,
    logicalId: topic.logicalId,
    unitLogicalId: topic.unitLogicalId,
    unitSlug,
    unitNumber,
    patternKo: topic.patternKo,
    category: topic.category,
    usageKey: topic.usageKey,
    title: { ko: topic.titleKo, ru: topic.titleRu },
    summary: { ko: topic.summaryKo, ru: topic.summaryRu },
    contentVersion: topic.contentVersion,
    language: { pattern: "ko", summary: "ru" },
    detail: topic.detail ?? null,
  };
}
