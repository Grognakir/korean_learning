import type { Exercise } from "@/features/training/domain";
import {
  publishedCurriculumFixture,
  type FixtureCurriculumExercise,
  type PublishedCurriculumFixture,
} from "@/modules/curriculum/fixtures/publishedCurriculumFixture";

function mapOne(
  exercise: FixtureCurriculumExercise,
  fixture: PublishedCurriculumFixture,
): Exercise {
  const unit = fixture.units.find((item) => item.logicalId === exercise.unitLogicalId);
  if (!unit) {
    throw new Error(`Missing unit for fixture exercise ${exercise.logicalId}`);
  }

  const base = {
    schemaVersion: 1 as const,
    id: exercise.id,
    logicalId: exercise.logicalId,
    moduleSlug: unit.slug,
    topicIds: exercise.grammarTopicLogicalId ? [exercise.grammarTopicLogicalId] : [],
    difficulty: exercise.difficulty,
    prompt: { ko: exercise.promptKo, ru: exercise.promptRu },
    explanation: { ko: null, ru: "Fixture approved curriculum exercise." },
    contentVersion: exercise.contentVersion,
    scoring: { points: 1, partialCredit: false },
  };

  const options = exercise.options.map((option) => ({
    id: option.id,
    label: { ko: option.labelKo, ru: option.labelRu },
  }));

  if (exercise.exerciseType === "meaning-choice") {
    return {
      ...base,
      type: "meaning-choice",
      options,
      correctOptionId: exercise.correctOptionId,
    };
  }

  if (exercise.exerciseType === "single-choice") {
    const passage = exercise.readingPassageLogicalId
      ? fixture.readingPassages.find((item) => item.logicalId === exercise.readingPassageLogicalId)
      : null;
    return {
      ...base,
      type: "single-choice",
      options,
      correctOptionId: exercise.correctOptionId,
      passage: passage
        ? {
            logicalId: passage.logicalId,
            title: { ko: passage.titleKo, ru: passage.titleRu },
            bodyKo: passage.bodyKo,
          }
        : null,
    };
  }

  throw new Error(`Unsupported fixture exercise type: ${exercise.exerciseType}`);
}

export function listFixtureDomainExercises(
  fixture: PublishedCurriculumFixture = publishedCurriculumFixture,
): readonly Exercise[] {
  return fixture.exercises
    .filter((exercise) => exercise.status === "approved")
    .map((exercise) => mapOne(exercise, fixture));
}

export function getFixtureDomainExerciseById(
  id: string,
  fixture: PublishedCurriculumFixture = publishedCurriculumFixture,
): Exercise | undefined {
  return listFixtureDomainExercises(fixture).find((exercise) => exercise.id === id);
}
