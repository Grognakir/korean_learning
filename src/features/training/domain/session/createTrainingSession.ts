import { TrainingSessionError } from "./errors";
import { seededShuffle } from "./seededShuffle";
import {
  TRAINING_SESSION_SCHEMA_VERSION,
  type TrainingSessionConfig,
  type TrainingSessionState,
} from "./types";

function assertUniqueExerciseIds(exerciseIds: readonly string[]): void {
  if (new Set(exerciseIds).size !== exerciseIds.length) {
    throw new TrainingSessionError(
      "duplicate-exercise-id",
      "Training session exercise ids must be unique.",
    );
  }
}

function resolveQueue(config: TrainingSessionConfig): readonly string[] {
  assertUniqueExerciseIds(config.exerciseIds);

  if (config.exerciseIds.length === 0) {
    throw new TrainingSessionError(
      "empty-queue",
      "Training session requires at least one exercise id.",
    );
  }

  if (!Number.isInteger(config.seed)) {
    throw new TrainingSessionError("invalid-seed", "Training session seed must be an integer.");
  }

  if (config.limit !== undefined) {
    if (!Number.isInteger(config.limit) || config.limit < 1) {
      throw new TrainingSessionError(
        "invalid-limit",
        "Training session limit must be a positive integer when provided.",
      );
    }
  }

  // Review / mistake-retry queues keep authored order (F1-I19).
  const ordered =
    config.mode === "review"
      ? [...config.exerciseIds]
      : seededShuffle(config.exerciseIds, config.seed);

  if (config.limit === undefined) {
    return ordered;
  }

  return ordered.slice(0, Math.min(config.limit, ordered.length));
}

export function createTrainingSession(config: TrainingSessionConfig): TrainingSessionState {
  const queue = resolveQueue(config);

  return {
    schemaVersion: TRAINING_SESSION_SCHEMA_VERSION,
    sessionId: config.sessionId,
    moduleSlug: config.moduleSlug,
    mode: config.mode,
    seed: config.seed,
    status: "active",
    queue,
    currentIndex: 0,
    attempts: [],
    startedAt: config.startedAt,
    lastActivityAt: config.startedAt,
    completedAt: null,
    contentSnapshot: {
      contentVersion: config.contentSnapshot.contentVersion,
      exerciseIds: [...config.contentSnapshot.exerciseIds],
    },
  };
}
