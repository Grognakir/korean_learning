export type TrainingSessionErrorCode =
  | "empty-queue"
  | "duplicate-exercise-id"
  | "invalid-limit"
  | "invalid-seed"
  | "session-not-active"
  | "exercise-not-current"
  | "already-answered"
  | "answer-required-before-next"
  | "invalid-evaluation";

export class TrainingSessionError extends Error {
  readonly code: TrainingSessionErrorCode;

  constructor(code: TrainingSessionErrorCode, message: string) {
    super(message);
    this.name = "TrainingSessionError";
    this.code = code;
  }
}
