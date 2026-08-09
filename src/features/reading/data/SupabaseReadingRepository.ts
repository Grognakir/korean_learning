import "server-only";

import { unstable_cache } from "next/cache";

import type { CatalogQuery } from "@/features/catalog/domain/types";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/serviceRoleClient";

import type { ReadingRepository } from "./ReadingRepository";
import type { PublicCurriculumExercise, PublicReadingPassage } from "../domain/types";

async function loadPublishedReadingBundle(): Promise<{
  passages: PublicReadingPassage[];
  exercises: PublicCurriculumExercise[];
}> {
  const supabase = createServiceRoleSupabaseClient();

  const [passagesResult, modulesResult, exercisesResult, optionsResult] = await Promise.all([
    supabase
      .from("reading_passages")
      .select(
        "id, logical_id, primary_module_id, title_ko, title_ru, body_ko, content_version, status",
      )
      .eq("status", "published"),
    supabase
      .from("learning_modules")
      .select("id, slug, unit_number")
      .eq("status", "published")
      .not("unit_number", "is", null),
    supabase
      .from("exercises")
      .select(
        "id, logical_id, module_id, learning_skill, type, difficulty, prompt_ko, prompt_ru, reading_passage_id, primary_topic_id, content_version, status",
      )
      .eq("status", "approved"),
    supabase.from("exercise_options_public").select("exercise_id, option_key, label_ko, label_ru"),
  ]);

  if (passagesResult.error) throw passagesResult.error;
  if (modulesResult.error) throw modulesResult.error;
  if (exercisesResult.error) throw exercisesResult.error;
  if (optionsResult.error) throw optionsResult.error;

  const modules = new Map(
    (modulesResult.data ?? []).map((module) => [
      module.id,
      { slug: module.slug, unitNumber: module.unit_number as number },
    ]),
  );

  const passages: PublicReadingPassage[] = (passagesResult.data ?? []).flatMap((passage) => {
    const learningModule = modules.get(passage.primary_module_id);
    if (!learningModule) {
      return [];
    }
    return [
      {
        id: passage.id,
        logicalId: passage.logical_id,
        unitSlug: learningModule.slug,
        unitNumber: learningModule.unitNumber,
        title: { ko: passage.title_ko, ru: passage.title_ru },
        bodyKo: passage.body_ko,
        contentVersion: passage.content_version as PublicReadingPassage["contentVersion"],
        language: { body: "ko", title: "ko" },
      },
    ];
  });

  const optionsByExercise = new Map<string, { id: string; label: { ko: string; ru: string } }[]>();
  for (const option of optionsResult.data ?? []) {
    if (!option.exercise_id || !option.option_key) {
      continue;
    }
    const exerciseId = option.exercise_id;
    const optionKey = option.option_key;
    const list = optionsByExercise.get(exerciseId) ?? [];
    list.push({
      id: optionKey,
      label: {
        ko: option.label_ko ?? option.label_ru ?? optionKey,
        ru: option.label_ru ?? option.label_ko ?? optionKey,
      },
    });
    optionsByExercise.set(exerciseId, list);
  }

  const passageLogicalById = new Map(passages.map((passage) => [passage.id, passage.logicalId]));

  const exercises: PublicCurriculumExercise[] = (exercisesResult.data ?? []).flatMap((exercise) => {
    const learningModule = modules.get(exercise.module_id);
    if (!learningModule) {
      return [];
    }
    return [
      {
        id: exercise.id,
        logicalId: exercise.logical_id,
        unitSlug: learningModule.slug,
        skill: exercise.learning_skill,
        exerciseType: exercise.type,
        difficulty: exercise.difficulty,
        prompt: {
          ko: exercise.prompt_ko ?? exercise.prompt_ru ?? "",
          ru: exercise.prompt_ru ?? exercise.prompt_ko ?? "",
        },
        options: optionsByExercise.get(exercise.id) ?? [],
        readingPassageLogicalId: exercise.reading_passage_id
          ? (passageLogicalById.get(exercise.reading_passage_id) ?? null)
          : null,
        grammarTopicLogicalId: null,
        contentVersion: exercise.content_version as PublicCurriculumExercise["contentVersion"],
      },
    ];
  });

  return { passages, exercises };
}

const getCachedReadingBundle = unstable_cache(loadPublishedReadingBundle, ["curriculum-reading"], {
  tags: ["curriculum-reading"],
  revalidate: 3600,
});

export class SupabaseReadingRepository implements ReadingRepository {
  async listPassages(
    query: Pick<CatalogQuery, "unitSlug"> = {},
  ): Promise<readonly PublicReadingPassage[]> {
    const bundle = await getCachedReadingBundle();
    if (!query.unitSlug) {
      return bundle.passages;
    }
    return bundle.passages.filter((passage) => passage.unitSlug === query.unitSlug);
  }

  async getPassageByLogicalId(logicalId: string): Promise<PublicReadingPassage | undefined> {
    const bundle = await getCachedReadingBundle();
    return bundle.passages.find((passage) => passage.logicalId === logicalId);
  }

  async listApprovedExercises(
    query: CatalogQuery = {},
  ): Promise<readonly PublicCurriculumExercise[]> {
    const bundle = await getCachedReadingBundle();
    let exercises = bundle.exercises;

    if (query.unitSlug) {
      exercises = exercises.filter((exercise) => exercise.unitSlug === query.unitSlug);
    }
    if (query.learningSkill) {
      exercises = exercises.filter((exercise) => exercise.skill === query.learningSkill);
    }
    if (query.difficulty) {
      exercises = exercises.filter((exercise) => exercise.difficulty === query.difficulty);
    }
    if (query.grammarTopicId) {
      exercises = exercises.filter(
        (exercise) => exercise.grammarTopicLogicalId === query.grammarTopicId,
      );
    }

    return exercises;
  }
}
