export class ContentValidationError extends Error {
  readonly code = "CONTENT_VALIDATION_FAILED" as const;

  constructor(message: string) {
    super(message);
    this.name = "ContentValidationError";
  }
}
