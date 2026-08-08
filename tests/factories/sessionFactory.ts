import {
  createTrainingSession,
  type Exercise,
  type TrainingSessionConfig,
  type TrainingSessionState,
} from "@/features/training";

export function createSessionConfig(
  exercises: readonly Exercise[],
  overrides: Partial<TrainingSessionConfig> = {},
): TrainingSessionConfig {
  const exerciseIds = exercises.map((exercise) => exercise.id);

  return {
    sessionId: "integration-session",
    moduleSlug: exercises[0]?.moduleSlug ?? "integration-module",
    mode: "practice",
    seed: 7,
    exerciseIds,
    startedAt: "2026-08-08T10:00:00.000Z",
    contentSnapshot: {
      contentVersion: exercises[0]?.contentVersion ?? "1.0.0",
      exerciseIds,
    },
    ...overrides,
  };
}

export function createActiveSession(
  exercises: readonly Exercise[],
  overrides: Partial<TrainingSessionConfig> = {},
): TrainingSessionState {
  return createTrainingSession(createSessionConfig(exercises, overrides));
}
