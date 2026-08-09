import type { TrainingSetupRequest } from "./trainingSetupSchema";

const PREFIX = "filt";

export type ParsedFilteredSessionId = {
  readonly request: TrainingSetupRequest;
  readonly seed: number;
};

function encodeNullable(value: string | null): string {
  return value && value.length > 0 ? encodeURIComponent(value) : "none";
}

function decodeNullable(value: string): string | null {
  return value === "none" ? null : decodeURIComponent(value);
}

/** Compact deterministic session id for guest filtered runs (parseable by the session page). */
export function buildFilteredSessionId(input: {
  readonly request: TrainingSetupRequest;
  readonly seed: number;
}): string {
  const { request, seed } = input;
  return [
    PREFIX,
    request.skill,
    encodeURIComponent(request.unitSlug),
    encodeNullable(request.grammarTopicId),
    encodeNullable(request.difficulty),
    String(request.sessionSize),
    String(seed),
  ].join("__");
}

export function parseFilteredSessionId(sessionId: string): ParsedFilteredSessionId | null {
  if (!sessionId.startsWith(`${PREFIX}__`)) {
    return null;
  }

  const parts = sessionId.split("__");
  if (parts.length !== 7 || parts[0] !== PREFIX) {
    return null;
  }

  const skill = parts[1];
  const unitSlug = decodeURIComponent(parts[2] ?? "");
  const grammarTopicId = decodeNullable(parts[3] ?? "_");
  const difficulty = decodeNullable(parts[4] ?? "_");
  const sessionSize = Number(parts[5]);
  const seed = Number(parts[6]);

  if (
    (skill !== "grammar" && skill !== "vocabulary" && skill !== "reading") ||
    !unitSlug ||
    !Number.isInteger(sessionSize) ||
    sessionSize < 1 ||
    !Number.isInteger(seed)
  ) {
    return null;
  }

  if (
    difficulty !== null &&
    difficulty !== "easy" &&
    difficulty !== "medium" &&
    difficulty !== "hard"
  ) {
    return null;
  }

  return {
    seed,
    request: {
      skill,
      unitSlug,
      grammarTopicId: skill === "grammar" ? grammarTopicId : null,
      difficulty,
      sessionSize,
    },
  };
}

export function isFilteredSessionId(sessionId: string): boolean {
  return parseFilteredSessionId(sessionId) !== null;
}
