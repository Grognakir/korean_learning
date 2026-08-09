import type { SupabaseClient } from "@supabase/supabase-js";

import type { TrainingSessionResponse } from "@/features/training/api/schemas";
import { TrainingPersistenceError } from "@/features/training/application/errors";
import { startTrainingSession } from "@/features/training/application/trainingPersistence";
import type { Database } from "@/types/database";

import { ReviewRepositoryError } from "../data/reviewMapper";
import { createSupabaseReviewRepository } from "../data/SupabaseReviewRepository";
import type { LearningSkill } from "../domain/conceptKey";
import { filterReviewQueueItems } from "../domain/filterReviewItems";

async function resolveModuleIdBySlug(
  client: SupabaseClient<Database>,
  unitSlug: string,
): Promise<string> {
  const { data, error } = await client
    .from("learning_modules")
    .select("id,status")
    .eq("slug", unitSlug)
    .maybeSingle();

  if (error) {
    throw new TrainingPersistenceError("PERSISTENCE_FAILED", error.message, 503);
  }

  if (!data || data.status !== "published") {
    throw new TrainingPersistenceError("MODULE_NOT_FOUND", "Unit is unavailable.", 404);
  }

  return data.id;
}

async function resolveApprovedExercisesForConcepts(
  client: SupabaseClient<Database>,
  input: {
    readonly moduleId: string;
    readonly conceptKeys: readonly string[];
  },
) {
  const { data, error } = await client.rpc("resolve_approved_exercises_for_concepts", {
    p_module_id: input.moduleId,
    p_concept_keys: [...input.conceptKeys],
  });

  if (error) {
    throw new TrainingPersistenceError("PERSISTENCE_FAILED", error.message, 503);
  }

  const byConcept = new Map<string, { id: string; content_version: string }>();

  for (const row of data ?? []) {
    byConcept.set(row.concept_key, {
      id: row.exercise_id,
      content_version: row.content_version,
    });
  }

  return byConcept;
}

export async function createReviewSession(input: {
  readonly client: SupabaseClient<Database>;
  readonly userId: string;
  readonly now?: string;
  readonly moduleId?: string;
  readonly unitSlug?: string;
  readonly skill?: LearningSkill;
  readonly idempotencyKey?: string;
}): Promise<TrainingSessionResponse> {
  const now = input.now ?? new Date().toISOString();
  const repository = createSupabaseReviewRepository(input.client);

  let dueItems;

  try {
    dueItems = await repository.listDueItems(input.userId, now);
  } catch (error) {
    if (error instanceof ReviewRepositoryError) {
      throw new TrainingPersistenceError("PERSISTENCE_FAILED", error.message, 503);
    }

    throw error;
  }

  if (dueItems.length === 0) {
    throw new TrainingPersistenceError(
      "EXERCISE_NOT_FOUND",
      "There are no review items due right now.",
      400,
    );
  }

  const moduleId =
    input.moduleId ??
    (input.unitSlug ? await resolveModuleIdBySlug(input.client, input.unitSlug) : undefined);

  const filtered = filterReviewQueueItems(dueItems, {
    skill: input.skill ?? null,
    moduleId: moduleId ?? null,
  });

  if (filtered.length === 0) {
    throw new TrainingPersistenceError(
      "EXERCISE_NOT_FOUND",
      "There are no review items due for the selected skill or unit.",
      400,
    );
  }

  const selectedModuleId = moduleId ?? filtered[0]!.moduleId;
  const moduleDue = filtered.filter((item) => item.moduleId === selectedModuleId);

  if (moduleDue.length === 0) {
    throw new TrainingPersistenceError(
      "EXERCISE_NOT_FOUND",
      "There are no review items due for this module.",
      400,
    );
  }

  const byConcept = await resolveApprovedExercisesForConcepts(input.client, {
    moduleId: selectedModuleId,
    conceptKeys: moduleDue.map((item) => item.conceptKey),
  });

  const exerciseIds: string[] = [];
  let contentVersion: string | undefined;

  for (const item of moduleDue) {
    const exercise = byConcept.get(item.conceptKey);

    if (!exercise) {
      continue;
    }

    exerciseIds.push(exercise.id);
    contentVersion ??= exercise.content_version;
  }

  if (exerciseIds.length === 0 || !contentVersion) {
    throw new TrainingPersistenceError(
      "EXERCISE_NOT_FOUND",
      "Approved exercises for due review items are unavailable.",
      400,
    );
  }

  const filterSuffix = [input.skill ?? "all", input.unitSlug ?? selectedModuleId].join(":");

  return startTrainingSession({
    client: input.client,
    userId: input.userId,
    request: {
      moduleId: selectedModuleId,
      mode: "review",
      contentVersion,
      exerciseIds,
      randomSeed: `review:${selectedModuleId}:${filterSuffix}:${now}`,
      idempotencyKey:
        input.idempotencyKey ??
        `review:${input.userId}:${selectedModuleId}:${filterSuffix}:${now.slice(0, 16)}`,
    },
  });
}
