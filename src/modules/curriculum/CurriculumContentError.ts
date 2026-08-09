export class CurriculumContentError extends Error {
  readonly code = "CURRICULUM_CONTENT_UNAVAILABLE" as const;

  constructor(context: string, cause: unknown) {
    const detail =
      cause instanceof Error
        ? cause.message
        : typeof cause === "object" &&
            cause !== null &&
            "message" in cause &&
            typeof cause.message === "string"
          ? cause.message
          : "Unknown content store error";
    super(`${context}: ${detail}`, { cause });
    this.name = "CurriculumContentError";
  }
}
