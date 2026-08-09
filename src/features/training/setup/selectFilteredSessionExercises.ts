import { seededShuffle } from "../domain/session/seededShuffle";
import type { TrainingSetupRequest } from "./trainingSetupSchema";

export type FilterableExercise = {
  readonly id: string;
  readonly skill: "grammar" | "vocabulary" | "reading";
  readonly unitSlug: string;
  readonly difficulty: "easy" | "medium" | "hard";
  readonly grammarTopicLogicalId: string | null;
  readonly contentVersion: string;
  readonly status?: "approved" | "draft" | "reviewed" | "rejected" | "archived";
};

export type FilteredSessionSelection = {
  readonly exerciseIds: readonly string[];
  readonly contentVersion: string;
  readonly seed: number;
  readonly availableCount: number;
};

export class FilteredSessionSelectionError extends Error {
  readonly code: "INSUFFICIENT_CONTENT" | "INVALID_FILTER" | "DRAFT_CONTENT";

  constructor(code: FilteredSessionSelectionError["code"], message: string) {
    super(message);
    this.name = "FilteredSessionSelectionError";
    this.code = code;
  }
}

export function filterApprovedExercisesForSetup(
  exercises: readonly FilterableExercise[],
  request: TrainingSetupRequest,
): FilterableExercise[] {
  return exercises.filter((exercise) => {
    if (exercise.status !== undefined && exercise.status !== "approved") {
      return false;
    }
    if (exercise.skill !== request.skill) return false;
    if (exercise.unitSlug !== request.unitSlug) return false;
    if (request.difficulty && exercise.difficulty !== request.difficulty) return false;
    if (
      request.skill === "grammar" &&
      request.grammarTopicId &&
      exercise.grammarTopicLogicalId !== request.grammarTopicId
    ) {
      return false;
    }
    return true;
  });
}

/** Deterministic selection: shuffle by seed, clamp to sessionSize, never pad with drafts. */
export function selectFilteredSessionExercises(input: {
  readonly exercises: readonly FilterableExercise[];
  readonly request: TrainingSetupRequest;
  readonly seed: number;
}): FilteredSessionSelection {
  const approved = filterApprovedExercisesForSetup(input.exercises, input.request);

  if (approved.length === 0) {
    throw new FilteredSessionSelectionError(
      "INSUFFICIENT_CONTENT",
      "No approved exercises match the selected filters.",
    );
  }

  const versions = new Set(approved.map((exercise) => exercise.contentVersion));
  if (versions.size !== 1) {
    // Prefer the most common version; still deterministic by sorting ids within version.
    const byVersion = new Map<string, FilterableExercise[]>();
    for (const exercise of approved) {
      const list = byVersion.get(exercise.contentVersion) ?? [];
      list.push(exercise);
      byVersion.set(exercise.contentVersion, list);
    }
    const [contentVersion, cohort] = [...byVersion.entries()].sort((left, right) => {
      const countDiff = right[1].length - left[1].length;
      if (countDiff !== 0) return countDiff;
      return left[0].localeCompare(right[0]);
    })[0]!;
    return selectFromCohort(cohort, contentVersion, input.request.sessionSize, input.seed);
  }

  const contentVersion = approved[0]!.contentVersion;
  return selectFromCohort(approved, contentVersion, input.request.sessionSize, input.seed);
}

function selectFromCohort(
  cohort: readonly FilterableExercise[],
  contentVersion: string,
  sessionSize: number,
  seed: number,
): FilteredSessionSelection {
  const sortedIds = [...cohort].map((exercise) => exercise.id).sort((a, b) => a.localeCompare(b));
  const shuffled = seededShuffle(sortedIds, seed);
  const limit = Math.min(Math.max(1, sessionSize), shuffled.length);

  return {
    exerciseIds: shuffled.slice(0, limit),
    contentVersion,
    seed,
    availableCount: cohort.length,
  };
}
