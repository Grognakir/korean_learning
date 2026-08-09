export type TrainingPersistenceErrorCode =
  | "UNAUTHORIZED"
  | "NOT_FOUND"
  | "FORBIDDEN"
  | "VALIDATION_FAILED"
  | "SESSION_NOT_ACTIVE"
  | "SESSION_ALREADY_COMPLETED"
  | "EXERCISE_NOT_IN_SESSION"
  | "EXERCISE_NOT_FOUND"
  | "INSUFFICIENT_CONTENT"
  | "ACTIVE_SESSION_EXISTS"
  | "VERSION_MISMATCH"
  | "MODULE_NOT_FOUND"
  | "IMPORT_ALREADY_DONE"
  | "PERSISTENCE_FAILED";

export class TrainingPersistenceError extends Error {
  readonly code: TrainingPersistenceErrorCode;
  readonly status: number;

  constructor(code: TrainingPersistenceErrorCode, message: string, status = 400) {
    super(message);
    this.name = "TrainingPersistenceError";
    this.code = code;
    this.status = status;
  }
}

export function trainingPersistenceStatusForCode(code: TrainingPersistenceErrorCode): number {
  switch (code) {
    case "UNAUTHORIZED":
      return 401;
    case "NOT_FOUND":
    case "FORBIDDEN":
      return 404;
    case "VALIDATION_FAILED":
    case "SESSION_NOT_ACTIVE":
    case "SESSION_ALREADY_COMPLETED":
    case "EXERCISE_NOT_IN_SESSION":
    case "EXERCISE_NOT_FOUND":
    case "INSUFFICIENT_CONTENT":
    case "ACTIVE_SESSION_EXISTS":
    case "VERSION_MISMATCH":
    case "MODULE_NOT_FOUND":
    case "IMPORT_ALREADY_DONE":
      return 400;
    case "PERSISTENCE_FAILED":
      return 503;
  }
}
