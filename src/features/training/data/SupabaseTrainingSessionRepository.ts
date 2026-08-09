import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database, Json, Tables } from "@/types/database";

import type {
  CompleteTrainingSessionRequest,
  StartTrainingSessionRequest,
  SubmitTrainingAttemptRequest,
  TrainingSessionResponse,
} from "../api/schemas";
import type { AnswerEvaluation, AnswerSubmission, TrainingSessionState } from "../domain";
import { TrainingPersistenceError } from "../application/errors";
import {
  serializeNormalizedAnswer,
  serializeSubmissionForStorage,
} from "../application/attemptPayload";

type TrainingSessionRow = Tables<"training_sessions">;
type AttemptRow = Tables<"attempts">;
type SessionExerciseRow = Tables<"session_exercises">;

export type PersistedTrainingSession = {
  readonly session: TrainingSessionRow;
  readonly exercises: readonly SessionExerciseRow[];
  readonly attempts: readonly AttemptRow[];
};

export type TrainingSessionRepository = {
  findSessionByIdempotencyKey(
    userId: string,
    idempotencyKey: string,
  ): Promise<TrainingSessionRow | null>;
  findSessionById(userId: string, sessionId: string): Promise<PersistedTrainingSession | null>;
  createSession(input: {
    readonly userId: string;
    readonly request: StartTrainingSessionRequest;
    readonly exercises: readonly {
      readonly exerciseId: string;
      readonly exerciseVersion: string;
      readonly snapshotPayload: Json | null;
    }[];
  }): Promise<PersistedTrainingSession>;
  submitAttempt(input: {
    readonly userId: string;
    readonly sessionId: string;
    readonly request: SubmitTrainingAttemptRequest;
    readonly evaluation: AnswerEvaluation;
    readonly answerVersion: string;
    readonly mistake: {
      readonly moduleId: string;
      readonly primaryTopicId: string;
      readonly conceptKey: string;
      readonly errorType: string;
    } | null;
  }): Promise<{ readonly attempt: AttemptRow; readonly session: TrainingSessionRow }>;
  completeSession(input: {
    readonly userId: string;
    readonly sessionId: string;
    readonly request: CompleteTrainingSessionRequest;
  }): Promise<TrainingSessionRow>;
};

function mapRpcError(error: { message: string; code?: string }): never {
  const message = error.message.toLowerCase();

  if (message.includes("not authenticated")) {
    throw new TrainingPersistenceError("UNAUTHORIZED", "Authentication is required.", 401);
  }

  if (message.includes("session not found")) {
    throw new TrainingPersistenceError("NOT_FOUND", "Training session was not found.", 404);
  }

  if (message.includes("session already completed")) {
    throw new TrainingPersistenceError(
      "SESSION_ALREADY_COMPLETED",
      "Training session is already completed.",
      400,
    );
  }

  if (message.includes("session not active") || message.includes("attempts incomplete")) {
    throw new TrainingPersistenceError(
      "SESSION_NOT_ACTIVE",
      "Training session cannot accept this operation.",
      400,
    );
  }

  if (message.includes("exercise not in session")) {
    throw new TrainingPersistenceError(
      "EXERCISE_NOT_IN_SESSION",
      "Exercise is not available at the current session position.",
      400,
    );
  }

  throw new TrainingPersistenceError("PERSISTENCE_FAILED", error.message, 503);
}

export function mapTrainingSessionResponse(
  persisted: PersistedTrainingSession,
  moduleSlug: string,
): TrainingSessionResponse {
  const exerciseIds = [...persisted.exercises]
    .sort((left, right) => left.position - right.position)
    .map((row) => row.exercise_id);

  return {
    sessionId: persisted.session.id,
    moduleId: persisted.session.module_id,
    moduleSlug,
    mode: persisted.session.mode as TrainingSessionResponse["mode"],
    contentVersion: persisted.session.content_version,
    status: persisted.session.status,
    currentIndex: persisted.session.current_index,
    exerciseIds,
    randomSeed: persisted.session.random_seed,
    startedAt: persisted.session.started_at,
    completedAt: persisted.session.completed_at,
  };
}

export function restoreTrainingSessionState(input: {
  readonly persisted: PersistedTrainingSession;
  readonly moduleSlug: string;
  readonly seed: number;
  readonly attempts: readonly {
    readonly submissionId: string;
    readonly exerciseId: string;
    readonly submittedAt: string;
    readonly submission: AnswerSubmission;
    readonly evaluation: AnswerEvaluation;
  }[];
}): TrainingSessionState {
  const exerciseIds = [...input.persisted.exercises]
    .sort((left, right) => left.position - right.position)
    .map((row) => row.exercise_id);

  const queue = exerciseIds;
  const answeredCount = input.attempts.length;
  const isCompleted = input.persisted.session.status === "completed";
  const currentIndex = isCompleted
    ? Math.max(queue.length - 1, 0)
    : answeredCount > 0
      ? answeredCount - 1
      : 0;

  return {
    schemaVersion: 1,
    sessionId: input.persisted.session.id,
    moduleSlug: input.moduleSlug,
    mode: input.persisted.session.mode as TrainingSessionState["mode"],
    seed: input.seed,
    status: input.persisted.session.status,
    queue,
    currentIndex,
    attempts: input.attempts.map((attempt) => ({
      submissionId: attempt.submissionId,
      exerciseId: attempt.exerciseId,
      submittedAt: attempt.submittedAt,
      submission: attempt.submission,
      evaluation: attempt.evaluation,
    })),
    startedAt: input.persisted.session.started_at,
    lastActivityAt: input.persisted.session.last_activity_at,
    completedAt: input.persisted.session.completed_at,
    contentSnapshot: {
      contentVersion: input.persisted.session.content_version,
      exerciseIds,
    },
  };
}

export function createSupabaseTrainingSessionRepository(
  client: SupabaseClient<Database>,
): TrainingSessionRepository {
  return {
    async findSessionByIdempotencyKey(userId, idempotencyKey) {
      const { data, error } = await client
        .from("training_sessions")
        .select("*")
        .eq("user_id", userId)
        .eq("idempotency_key", idempotencyKey)
        .maybeSingle();

      if (error) {
        throw new TrainingPersistenceError("PERSISTENCE_FAILED", error.message, 503);
      }

      return data;
    },

    async findSessionById(userId, sessionId) {
      const { data: session, error: sessionError } = await client
        .from("training_sessions")
        .select("*")
        .eq("id", sessionId)
        .eq("user_id", userId)
        .maybeSingle();

      if (sessionError) {
        throw new TrainingPersistenceError("PERSISTENCE_FAILED", sessionError.message, 503);
      }

      if (!session) {
        return null;
      }

      const [{ data: exercises, error: exercisesError }, { data: attempts, error: attemptsError }] =
        await Promise.all([
          client
            .from("session_exercises")
            .select("*")
            .eq("session_id", sessionId)
            .order("position", { ascending: true }),
          client
            .from("attempts")
            .select("*")
            .eq("session_id", sessionId)
            .order("attempt_number", { ascending: true }),
        ]);

      if (exercisesError || attemptsError) {
        throw new TrainingPersistenceError(
          "PERSISTENCE_FAILED",
          exercisesError?.message ?? attemptsError?.message ?? "Failed to load session details.",
          503,
        );
      }

      return {
        session,
        exercises: exercises ?? [],
        attempts: attempts ?? [],
      };
    },

    async createSession({ userId, request, exercises }) {
      const existing = await this.findSessionByIdempotencyKey(userId, request.idempotencyKey);
      if (existing) {
        const persisted = await this.findSessionById(userId, existing.id);
        if (!persisted) {
          throw new TrainingPersistenceError("NOT_FOUND", "Training session was not found.", 404);
        }

        return persisted;
      }

      const { data: session, error: sessionError } = await client
        .from("training_sessions")
        .insert({
          user_id: userId,
          module_id: request.moduleId,
          mode: request.mode,
          difficulty: request.difficulty ?? null,
          content_version: request.contentVersion,
          random_seed: request.randomSeed,
          idempotency_key: request.idempotencyKey,
        })
        .select("*")
        .single();

      if (sessionError || !session) {
        throw new TrainingPersistenceError(
          "PERSISTENCE_FAILED",
          sessionError?.message ?? "Failed to create training session.",
          503,
        );
      }

      const { error: exercisesError } = await client.from("session_exercises").insert(
        exercises.map((exercise, position) => ({
          session_id: session.id,
          exercise_id: exercise.exerciseId,
          position,
          exercise_version: exercise.exerciseVersion,
          snapshot_payload: exercise.snapshotPayload,
        })),
      );

      if (exercisesError) {
        await client.from("training_sessions").delete().eq("id", session.id);
        throw new TrainingPersistenceError("PERSISTENCE_FAILED", exercisesError.message, 503);
      }

      const persisted = await this.findSessionById(userId, session.id);
      if (!persisted) {
        throw new TrainingPersistenceError("NOT_FOUND", "Training session was not found.", 404);
      }

      return persisted;
    },

    async submitAttempt({ sessionId, request, evaluation, answerVersion, mistake }) {
      const { data, error } = await client.rpc("submit_training_attempt", {
        p_session_id: sessionId,
        p_exercise_id: request.exerciseId,
        p_idempotency_key: request.idempotencyKey,
        p_raw_answer: serializeSubmissionForStorage(request.submission),
        p_normalized_answer: serializeNormalizedAnswer(request.submission),
        p_is_correct: evaluation.isCorrect,
        p_score: evaluation.scoreRatio,
        p_reason_code: evaluation.reasonCode,
        p_answer_version: answerVersion,
        ...(request.durationMs === undefined ? {} : { p_duration_ms: request.durationMs }),
        ...(mistake?.moduleId === undefined ? {} : { p_mistake_module_id: mistake.moduleId }),
        ...(mistake?.primaryTopicId === undefined
          ? {}
          : { p_mistake_primary_topic_id: mistake.primaryTopicId }),
        ...(mistake?.conceptKey === undefined ? {} : { p_mistake_concept_key: mistake.conceptKey }),
        ...(mistake?.errorType === undefined ? {} : { p_mistake_error_type: mistake.errorType }),
      });

      if (error || !data) {
        mapRpcError(error ?? { message: "Attempt persistence failed." });
      }

      const { data: session, error: sessionError } = await client
        .from("training_sessions")
        .select("*")
        .eq("id", sessionId)
        .single();

      if (sessionError || !session) {
        throw new TrainingPersistenceError(
          "PERSISTENCE_FAILED",
          sessionError?.message ?? "Failed to reload training session.",
          503,
        );
      }

      return {
        attempt: data,
        session,
      };
    },

    async completeSession({ sessionId, request }) {
      const { data, error } = await client.rpc("complete_training_session", {
        p_session_id: sessionId,
        p_idempotency_key: request.idempotencyKey,
        p_completed_at: request.completedAt ?? new Date().toISOString(),
      });

      if (error || !data) {
        mapRpcError(error ?? { message: "Session completion failed." });
      }

      return data;
    },
  };
}
