import "server-only";

import { unstable_cache } from "next/cache";

import { createServiceRoleSupabaseClient } from "@/lib/supabase/serviceRoleClient";
import type { ExerciseTypeId } from "@/types";

import type { Exercise, ExerciseDifficulty } from "../domain";
import type { ExerciseQuery, ExerciseRepository } from "./ExerciseRepository";
import { ExerciseMapperError, mapExerciseRow, sortExerciseRows } from "./mappers/exerciseMapper";

export class SupabaseExerciseRepositoryError extends Error {
  readonly code = "SUPABASE_EXERCISE_REPOSITORY_ERROR" as const;

  constructor(message: string) {
    super(message);
    this.name = "SupabaseExerciseRepositoryError";
  }
}

const CACHE_TAG = "learning-exercises";

type LoadedExerciseBundle = {
  readonly exercises: readonly Exercise[];
  readonly moduleSlugById: Readonly<Record<string, string>>;
};

async function loadApprovedExercises(): Promise<LoadedExerciseBundle> {
  const client = createServiceRoleSupabaseClient();

  const [
    { data: moduleRows, error: moduleError },
    { data: exerciseRows, error: exerciseError },
    { data: topicLinkRows, error: topicLinkError },
    { data: optionRows, error: optionError },
    { data: acceptedAnswerRows, error: acceptedAnswerError },
    { data: passageRows, error: passageError },
  ] = await Promise.all([
    client.from("learning_modules").select("id,slug,status").eq("status", "published"),
    client.from("exercises").select("*").eq("status", "approved"),
    client.from("exercise_topics").select("*"),
    client.from("exercise_options").select("*"),
    client.from("accepted_answers").select("*"),
    client
      .from("reading_passages")
      .select("id,logical_id,title_ko,title_ru,body_ko,status")
      .eq("status", "published"),
  ]);

  if (moduleError) {
    throw new SupabaseExerciseRepositoryError(moduleError.message);
  }

  if (exerciseError) {
    throw new SupabaseExerciseRepositoryError(exerciseError.message);
  }

  if (topicLinkError) {
    throw new SupabaseExerciseRepositoryError(topicLinkError.message);
  }

  if (optionError) {
    throw new SupabaseExerciseRepositoryError(optionError.message);
  }

  if (acceptedAnswerError) {
    throw new SupabaseExerciseRepositoryError(acceptedAnswerError.message);
  }

  if (passageError) {
    throw new SupabaseExerciseRepositoryError(passageError.message);
  }

  const moduleSlugById = Object.fromEntries((moduleRows ?? []).map((row) => [row.id, row.slug]));
  const publishedModuleIds = new Set(Object.keys(moduleSlugById));
  const passageById = new Map(
    (passageRows ?? []).map((passage) => [
      passage.id,
      {
        logicalId: passage.logical_id,
        titleKo: passage.title_ko,
        titleRu: passage.title_ru,
        bodyKo: passage.body_ko,
      },
    ]),
  );

  const exercises = sortExerciseRows(exerciseRows ?? [])
    .filter((row) => publishedModuleIds.has(row.module_id))
    .map((row) => {
      const moduleSlug = moduleSlugById[row.module_id];

      if (!moduleSlug) {
        throw new SupabaseExerciseRepositoryError(`Missing module slug for exercise ${row.id}.`);
      }

      try {
        const passage =
          row.reading_passage_id == null ? null : (passageById.get(row.reading_passage_id) ?? null);
        if (row.reading_passage_id && !passage) {
          throw new SupabaseExerciseRepositoryError(
            `Missing published passage for exercise ${row.id}.`,
          );
        }
        return mapExerciseRow({
          row,
          moduleSlug,
          topicRows: topicLinkRows ?? [],
          optionRows: optionRows ?? [],
          acceptedAnswerRows: acceptedAnswerRows ?? [],
          passage,
        });
      } catch (error) {
        if (error instanceof ExerciseMapperError) {
          throw new SupabaseExerciseRepositoryError(
            `Exercise ${error.exerciseId} failed validation.`,
          );
        }

        throw error;
      }
    });

  return { exercises, moduleSlugById };
}

const getCachedExerciseBundle = unstable_cache(loadApprovedExercises, ["learning-exercises"], {
  tags: [CACHE_TAG],
  revalidate: 3600,
});

function matchesQuery(exercise: Exercise, query: ExerciseQuery): boolean {
  if (query.moduleSlug !== undefined && exercise.moduleSlug !== query.moduleSlug) {
    return false;
  }

  if (
    query.topicIds !== undefined &&
    !query.topicIds.some((topicId) => exercise.topicIds.includes(topicId))
  ) {
    return false;
  }

  if (query.types !== undefined && !query.types.includes(exercise.type as ExerciseTypeId)) {
    return false;
  }

  if (
    query.difficulties !== undefined &&
    !query.difficulties.includes(exercise.difficulty as ExerciseDifficulty)
  ) {
    return false;
  }

  return true;
}

export class SupabaseExerciseRepository implements ExerciseRepository {
  readonly #bundlePromise: Promise<LoadedExerciseBundle>;

  constructor(loadBundle: () => Promise<LoadedExerciseBundle> = getCachedExerciseBundle) {
    this.#bundlePromise = loadBundle();
  }

  async getById(id: string): Promise<Exercise | undefined> {
    const bundle = await this.#bundlePromise;
    return bundle.exercises.find((exercise) => exercise.id === id);
  }

  async list(query: ExerciseQuery = {}): Promise<readonly Exercise[]> {
    const bundle = await this.#bundlePromise;
    return bundle.exercises.filter((exercise) => matchesQuery(exercise, query));
  }
}

export async function loadExerciseForEvaluation(
  exerciseId: string,
  contentVersion?: string,
): Promise<Exercise | undefined> {
  const repository = new SupabaseExerciseRepository();
  const exercise = await repository.getById(exerciseId);

  if (!exercise) {
    return undefined;
  }

  if (contentVersion !== undefined && exercise.contentVersion !== contentVersion) {
    return undefined;
  }

  return exercise;
}
