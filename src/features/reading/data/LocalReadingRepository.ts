import type { CatalogQuery } from "@/features/catalog/domain/types";
import {
  publishedCurriculumFixture,
  type PublishedCurriculumFixture,
} from "@/modules/curriculum/fixtures/publishedCurriculumFixture";

import type { ReadingRepository } from "./ReadingRepository";
import type { PublicCurriculumExercise, PublicReadingPassage } from "../domain/types";

function toPublicExercise(
  exercise: PublishedCurriculumFixture["exercises"][number],
  unitSlug: string,
): PublicCurriculumExercise {
  return {
    id: exercise.id,
    logicalId: exercise.logicalId,
    unitSlug,
    skill: exercise.skill,
    exerciseType: exercise.exerciseType,
    difficulty: exercise.difficulty,
    prompt: { ko: exercise.promptKo, ru: exercise.promptRu },
    options: exercise.options.map((option) => ({
      id: option.id,
      label: { ko: option.labelKo, ru: option.labelRu },
    })),
    readingPassageLogicalId: exercise.readingPassageLogicalId,
    grammarTopicLogicalId: exercise.grammarTopicLogicalId,
    contentVersion: exercise.contentVersion,
  };
}

export class LocalReadingRepository implements ReadingRepository {
  constructor(private readonly fixture: PublishedCurriculumFixture = publishedCurriculumFixture) {}

  async listPassages(
    query: Pick<CatalogQuery, "unitSlug"> = {},
  ): Promise<readonly PublicReadingPassage[]> {
    const unitByLogical = new Map(this.fixture.units.map((unit) => [unit.logicalId, unit]));
    let passages = this.fixture.readingPassages.filter((passage) => passage.status === "published");

    if (query.unitSlug) {
      const unit = this.fixture.units.find((item) => item.slug === query.unitSlug);
      if (!unit) {
        return [];
      }
      passages = passages.filter((passage) => passage.unitLogicalId === unit.logicalId);
    }

    return passages.map((passage) => {
      const unit = unitByLogical.get(passage.unitLogicalId);
      if (!unit) {
        throw new Error(`Missing unit for passage ${passage.logicalId}`);
      }
      return {
        id: passage.id,
        logicalId: passage.logicalId,
        unitSlug: unit.slug,
        unitNumber: unit.unitNumber,
        title: { ko: passage.titleKo, ru: passage.titleRu },
        bodyKo: passage.bodyKo,
        contentVersion: passage.contentVersion,
        language: { body: "ko", title: "ko" },
      };
    });
  }

  async getPassageByLogicalId(logicalId: string): Promise<PublicReadingPassage | undefined> {
    const items = await this.listPassages();
    return items.find((passage) => passage.logicalId === logicalId);
  }

  async listApprovedExercises(
    query: CatalogQuery = {},
  ): Promise<readonly PublicCurriculumExercise[]> {
    const unitByLogical = new Map(this.fixture.units.map((unit) => [unit.logicalId, unit]));
    let exercises = this.fixture.exercises.filter((exercise) => exercise.status === "approved");

    if (query.unitSlug) {
      const unit = this.fixture.units.find((item) => item.slug === query.unitSlug);
      if (!unit) {
        return [];
      }
      exercises = exercises.filter((exercise) => exercise.unitLogicalId === unit.logicalId);
    }

    if (query.grammarTopicId) {
      exercises = exercises.filter(
        (exercise) =>
          exercise.grammarTopicLogicalId === query.grammarTopicId ||
          this.fixture.grammarTopics.some(
            (topic) =>
              topic.id === query.grammarTopicId &&
              topic.logicalId === exercise.grammarTopicLogicalId,
          ),
      );
    }

    if (query.learningSkill) {
      exercises = exercises.filter((exercise) => exercise.skill === query.learningSkill);
    }

    if (query.difficulty) {
      exercises = exercises.filter((exercise) => exercise.difficulty === query.difficulty);
    }

    return exercises.map((exercise) => {
      const unit = unitByLogical.get(exercise.unitLogicalId);
      if (!unit) {
        throw new Error(`Missing unit for exercise ${exercise.logicalId}`);
      }
      return toPublicExercise(exercise, unit.slug);
    });
  }
}
