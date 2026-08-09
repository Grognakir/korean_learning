import "server-only";

import { unstable_cache } from "next/cache";

import { createServiceRoleSupabaseClient } from "@/lib/supabase/serviceRoleClient";
import { loadAllSupabaseRows } from "@/lib/supabase/loadAllSupabaseRows";
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

  const [moduleRows, exerciseRows, topicLinkRows, optionRows, acceptedAnswerRows, passageRows] =
    await Promise.all([
      loadAllSupabaseRows((from, to) =>
        client
          .from("learning_modules")
          .select("id,slug,status")
          .eq("status", "published")
          .order("id")
          .range(from, to),
      ),
      loadAllSupabaseRows((from, to) =>
        client.from("exercises").select("*").eq("status", "approved").order("id").range(from, to),
      ),
      loadAllSupabaseRows((from, to) =>
        client.from("exercise_topics").select("*").order("exercise_id").range(from, to),
      ),
      loadAllSupabaseRows((from, to) =>
        client.from("exercise_options").select("*").order("id").range(from, to),
      ),
      loadAllSupabaseRows((from, to) =>
        client.from("accepted_answers").select("*").order("id").range(from, to),
      ),
      loadAllSupabaseRows((from, to) =>
        client
          .from("reading_passages")
          .select("id,logical_id,title_ko,title_ru,body_ko,status")
          .eq("status", "published")
          .order("id")
          .range(from, to),
      ),
    ]);

  const moduleSlugById = Object.fromEntries(moduleRows.map((row) => [row.id, row.slug]));
  const publishedModuleIds = new Set(Object.keys(moduleSlugById));
  const passageById = new Map(
    passageRows.map((passage) => [
      passage.id,
      {
        logicalId: passage.logical_id,
        titleKo: passage.title_ko,
        titleRu: passage.title_ru,
        bodyKo: passage.body_ko,
      },
    ]),
  );

  const exercises = sortExerciseRows(exerciseRows)
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
          topicRows: topicLinkRows,
          optionRows,
          acceptedAnswerRows,
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
