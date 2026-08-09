import type { SupabaseClient } from "@supabase/supabase-js";

import type { TrainingSessionResponse } from "@/features/training/api/schemas";
import { TrainingPersistenceError } from "@/features/training/application/errors";
import { startTrainingSession } from "@/features/training/application/trainingPersistence";
import type { Database } from "@/types/database";

import { ReviewRepositoryError } from "../data/reviewMapper";
import { createSupabaseReviewRepository } from "../data/SupabaseReviewRepository";

async function resolveApprovedExercisesForConcepts(
  client: SupabaseClient<Database>,
  input: {
    readonly moduleId: string;
    readonly conceptKeys: readonly string[];
  },
) {
  const { data, error } = await client
    .from("exercises")
    .select("id,logical_id,module_id,content_version,status")
    .eq("module_id", input.moduleId)
    .eq("status", "approved")
    .in("logical_id", [...input.conceptKeys]);

  if (error) {
    throw new TrainingPersistenceError("PERSISTENCE_FAILED", error.message, 503);
  }

  const byConcept = new Map<string, (typeof data)[number]>();

  for (const row of data ?? []) {
    const existing = byConcept.get(row.logical_id);

    if (!existing || row.content_version > existing.content_version) {
      byConcept.set(row.logical_id, row);
    }
  }

  return byConcept;
}

export async function createReviewSession(input: {
  readonly client: SupabaseClient<Database>;
  readonly userId: string;
  readonly now?: string;
  readonly moduleId?: string;
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

  const moduleId = input.moduleId ?? dueItems[0]!.moduleId;
  const moduleDue = dueItems.filter((item) => item.moduleId === moduleId);

  if (moduleDue.length === 0) {
    throw new TrainingPersistenceError(
      "EXERCISE_NOT_FOUND",
      "There are no review items due for this module.",
      400,
    );
  }

  const byConcept = await resolveApprovedExercisesForConcepts(input.client, {
    moduleId,
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

  return startTrainingSession({
    client: input.client,
    userId: input.userId,
    request: {
      moduleId,
      mode: "review",
      contentVersion,
      exerciseIds,
      randomSeed: `review:${moduleId}:${now}`,
      idempotencyKey:
        input.idempotencyKey ?? `review:${input.userId}:${moduleId}:${now.slice(0, 16)}`,
    },
  });
}
