import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database";

import type { StartTrainingSessionRequest, TrainingSessionResponse } from "../api/schemas";
import { TrainingPersistenceError } from "./errors";
import {
  createSupabaseTrainingSessionRepository,
  mapTrainingSessionResponse,
} from "../data/SupabaseTrainingSessionRepository";
import { evaluateTrainingSubmission } from "../server/evaluateTrainingSubmission";

async function loadModuleSlug(client: SupabaseClient<Database>, moduleId: string): Promise<string> {
  const { data, error } = await client
    .from("learning_modules")
    .select("slug,status,content_version")
    .eq("id", moduleId)
    .maybeSingle();

  if (error) {
    throw new TrainingPersistenceError("PERSISTENCE_FAILED", error.message, 503);
  }

  if (!data || data.status !== "published") {
    throw new TrainingPersistenceError("MODULE_NOT_FOUND", "Module is unavailable.", 404);
  }

  return data.slug;
}

async function validateSessionExercises(
  client: SupabaseClient<Database>,
  input: {
    readonly moduleId: string;
    readonly contentVersion: string;
    readonly exerciseIds: readonly string[];
  },
) {
  const { data, error } = await client
    .from("exercises")
    .select("id,module_id,content_version,status")
    .in("id", [...input.exerciseIds]);

  if (error) {
    throw new TrainingPersistenceError("PERSISTENCE_FAILED", error.message, 503);
  }

  const rowsById = new Map((data ?? []).map((row) => [row.id, row]));

  for (const exerciseId of input.exerciseIds) {
    const row = rowsById.get(exerciseId);

    if (!row || row.status !== "approved") {
      throw new TrainingPersistenceError("EXERCISE_NOT_FOUND", "Exercise is unavailable.", 400);
    }

    if (row.module_id !== input.moduleId) {
      throw new TrainingPersistenceError(
        "EXERCISE_NOT_IN_SESSION",
        "Exercise does not belong to the requested module.",
        400,
      );
    }

    if (row.content_version !== input.contentVersion) {
      throw new TrainingPersistenceError(
        "VERSION_MISMATCH",
        "Exercise content version does not match the session.",
        400,
      );
    }
  }

  return input.exerciseIds.map((exerciseId) => ({
    exerciseId,
    exerciseVersion: rowsById.get(exerciseId)!.content_version,
    snapshotPayload: null,
  }));
}

export async function startTrainingSession(input: {
  readonly client: SupabaseClient<Database>;
  readonly userId: string;
  readonly request: StartTrainingSessionRequest;
}): Promise<TrainingSessionResponse> {
  const repository = createSupabaseTrainingSessionRepository(input.client);
  const moduleSlug = await loadModuleSlug(input.client, input.request.moduleId);
  const exercises = await validateSessionExercises(input.client, {
    moduleId: input.request.moduleId,
    contentVersion: input.request.contentVersion,
    exerciseIds: input.request.exerciseIds,
  });

  const persisted = await repository.createSession({
    userId: input.userId,
    request: input.request,
    exercises,
  });

  return mapTrainingSessionResponse(persisted, moduleSlug);
}

export async function submitTrainingAttempt(input: {
  readonly client: SupabaseClient<Database>;
  readonly userId: string;
  readonly sessionId: string;
  readonly request: import("../api/schemas").SubmitTrainingAttemptRequest;
}) {
  const repository = createSupabaseTrainingSessionRepository(input.client);
  const persisted = await repository.findSessionById(input.userId, input.sessionId);

  if (!persisted) {
    throw new TrainingPersistenceError("NOT_FOUND", "Training session was not found.", 404);
  }

  if (persisted.session.status !== "active") {
    throw new TrainingPersistenceError(
      "SESSION_NOT_ACTIVE",
      "Training session is not accepting attempts.",
      400,
    );
  }

  if (input.request.contentVersion !== persisted.session.content_version) {
    throw new TrainingPersistenceError(
      "VERSION_MISMATCH",
      "Session content version does not match the request.",
      400,
    );
  }

  const orderedExerciseIds = [...persisted.exercises]
    .sort((left, right) => left.position - right.position)
    .map((row) => row.exercise_id);

  if (!orderedExerciseIds.includes(input.request.exerciseId)) {
    throw new TrainingPersistenceError(
      "EXERCISE_NOT_IN_SESSION",
      "Exercise is not part of this session.",
      400,
    );
  }

  const evaluation = await evaluateTrainingSubmission({
    exerciseId: input.request.exerciseId,
    contentVersion: input.request.contentVersion,
    submission: input.request.submission,
  });

  const { data: exerciseMeta, error: exerciseError } = await input.client
    .from("exercises")
    .select("id,logical_id,module_id")
    .eq("id", input.request.exerciseId)
    .maybeSingle();

  if (exerciseError || !exerciseMeta) {
    throw new TrainingPersistenceError("EXERCISE_NOT_FOUND", "Exercise is unavailable.", 400);
  }

  const { data: topicLink, error: topicError } = await input.client
    .from("exercise_topics")
    .select("topic_id")
    .eq("exercise_id", input.request.exerciseId)
    .eq("role", "primary")
    .maybeSingle();

  if (topicError || !topicLink) {
    throw new TrainingPersistenceError(
      "EXERCISE_NOT_FOUND",
      "Exercise topic metadata missing.",
      400,
    );
  }

  const { attempt, session } = await repository.submitAttempt({
    userId: input.userId,
    sessionId: input.sessionId,
    request: input.request,
    evaluation,
    answerVersion: input.request.contentVersion,
    mistake: evaluation.isCorrect
      ? null
      : {
          moduleId: exerciseMeta.module_id,
          primaryTopicId: topicLink.topic_id,
          conceptKey: exerciseMeta.logical_id,
          errorType: evaluation.reasonCode,
        },
  });

  const moduleSlug = await loadModuleSlug(input.client, session.module_id);

  return {
    attemptId: attempt.id,
    attemptNumber: attempt.attempt_number,
    evaluation,
    session: mapTrainingSessionResponse(
      {
        session,
        exercises: persisted.exercises,
        attempts: [...persisted.attempts, attempt],
      },
      moduleSlug,
    ),
  };
}

export async function completeTrainingSession(input: {
  readonly client: SupabaseClient<Database>;
  readonly userId: string;
  readonly sessionId: string;
  readonly request: import("../api/schemas").CompleteTrainingSessionRequest;
}): Promise<TrainingSessionResponse> {
  const repository = createSupabaseTrainingSessionRepository(input.client);
  const persisted = await repository.findSessionById(input.userId, input.sessionId);

  if (!persisted) {
    throw new TrainingPersistenceError("NOT_FOUND", "Training session was not found.", 404);
  }

  const session = await repository.completeSession({
    userId: input.userId,
    sessionId: input.sessionId,
    request: input.request,
  });

  const moduleSlug = await loadModuleSlug(input.client, session.module_id);

  return mapTrainingSessionResponse(
    {
      session,
      exercises: persisted.exercises,
      attempts: persisted.attempts,
    },
    moduleSlug,
  );
}

export async function importGuestTrainingSession(input: {
  readonly client: SupabaseClient<Database>;
  readonly userId: string;
  readonly request: import("../api/schemas").ImportGuestTrainingSessionRequest;
}): Promise<TrainingSessionResponse> {
  const importIdempotencyKey = `import:${input.request.guestSessionId}`;
  const repository = createSupabaseTrainingSessionRepository(input.client);
  const existing = await repository.findSessionByIdempotencyKey(input.userId, importIdempotencyKey);

  if (existing) {
    const persisted = await repository.findSessionById(input.userId, existing.id);
    if (!persisted) {
      throw new TrainingPersistenceError("NOT_FOUND", "Imported session was not found.", 404);
    }

    const moduleSlug = await loadModuleSlug(input.client, persisted.session.module_id);
    return mapTrainingSessionResponse(persisted, moduleSlug);
  }

  const started = await startTrainingSession({
    client: input.client,
    userId: input.userId,
    request: {
      moduleId: input.request.moduleId,
      mode: input.request.mode,
      contentVersion: input.request.contentVersion,
      exerciseIds: input.request.exerciseIds,
      idempotencyKey: importIdempotencyKey,
      randomSeed: input.request.randomSeed,
    },
  });

  for (const attempt of input.request.attempts) {
    await submitTrainingAttempt({
      client: input.client,
      userId: input.userId,
      sessionId: started.sessionId,
      request: {
        exerciseId: attempt.exerciseId,
        contentVersion: input.request.contentVersion,
        idempotencyKey: attempt.idempotencyKey,
        submission: attempt.submission,
        ...(attempt.durationMs === undefined ? {} : { durationMs: attempt.durationMs }),
      },
    });
  }

  if (input.request.completedAt) {
    return completeTrainingSession({
      client: input.client,
      userId: input.userId,
      sessionId: started.sessionId,
      request: {
        idempotencyKey: `${importIdempotencyKey}:complete`,
        completedAt: input.request.completedAt,
      },
    });
  }

  const persisted = await repository.findSessionById(input.userId, started.sessionId);
  if (!persisted) {
    throw new TrainingPersistenceError("NOT_FOUND", "Imported session was not found.", 404);
  }

  const moduleSlug = await loadModuleSlug(input.client, persisted.session.module_id);
  return mapTrainingSessionResponse(persisted, moduleSlug);
}
