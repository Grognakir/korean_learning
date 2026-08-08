import type { AnswerEvaluation, AnswerSubmission } from "../evaluation";

export const TRAINING_SESSION_SCHEMA_VERSION = 1 as const;

export type TrainingSessionSchemaVersion = typeof TRAINING_SESSION_SCHEMA_VERSION;

export const TRAINING_SESSION_MODES = ["practice", "review"] as const;
export type TrainingSessionMode = (typeof TRAINING_SESSION_MODES)[number];

export const TRAINING_SESSION_STATUSES = ["active", "completed", "abandoned"] as const;
export type TrainingSessionStatus = (typeof TRAINING_SESSION_STATUSES)[number];

export type TrainingSessionContentSnapshot = {
  readonly contentVersion: string;
  readonly exerciseIds: readonly string[];
};

export type TrainingSessionConfig = {
  readonly sessionId: string;
  readonly moduleSlug: string;
  readonly mode: TrainingSessionMode;
  readonly seed: number;
  readonly exerciseIds: readonly string[];
  readonly limit?: number;
  readonly startedAt: string;
  readonly contentSnapshot: TrainingSessionContentSnapshot;
};

export type TrainingAttemptSnapshot = {
  readonly submissionId: string;
  readonly exerciseId: string;
  readonly submittedAt: string;
  readonly submission: AnswerSubmission;
  readonly evaluation: AnswerEvaluation;
};

export type TrainingSessionState = {
  readonly schemaVersion: TrainingSessionSchemaVersion;
  readonly sessionId: string;
  readonly moduleSlug: string;
  readonly mode: TrainingSessionMode;
  readonly seed: number;
  readonly status: TrainingSessionStatus;
  readonly queue: readonly string[];
  readonly currentIndex: number;
  readonly attempts: readonly TrainingAttemptSnapshot[];
  readonly startedAt: string;
  readonly lastActivityAt: string;
  readonly completedAt: string | null;
  readonly contentSnapshot: TrainingSessionContentSnapshot;
};

export type TrainingSessionAction =
  | {
      readonly type: "submit";
      readonly submissionId: string;
      readonly submission: AnswerSubmission;
      readonly evaluation: AnswerEvaluation;
      readonly occurredAt: string;
    }
  | {
      readonly type: "next";
      readonly occurredAt: string;
    }
  | {
      readonly type: "abandon";
      readonly occurredAt: string;
    };
