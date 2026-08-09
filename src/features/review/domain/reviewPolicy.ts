export const REVIEW_QUEUE_STATUSES = ["due", "scheduled", "mastered", "suspended"] as const;

export type ReviewQueueStatus = (typeof REVIEW_QUEUE_STATUSES)[number];

export const REVIEW_SESSION_MODES = ["practice", "review"] as const;

export type ReviewSessionMode = (typeof REVIEW_SESSION_MODES)[number];

/** Fixed phase-1 schedule: stage N correct → next stage / mastered. Intervals are whole UTC days. */
export const REVIEW_STAGE_INTERVALS_MS = [
  1 * 24 * 60 * 60 * 1000,
  3 * 24 * 60 * 60 * 1000,
  7 * 24 * 60 * 60 * 1000,
] as const;

export const REVIEW_MAX_STAGE = 3 as const;

export type ReviewQueueItemState = {
  readonly status: ReviewQueueStatus;
  readonly intervalStage: number;
  readonly consecutiveCorrect: number;
  readonly dueAt: string | null;
};

export type ReviewTransitionInput = {
  readonly mode: ReviewSessionMode;
  readonly isCorrect: boolean;
  readonly approvedExerciseAvailable: boolean;
  readonly current: ReviewQueueItemState | null;
  readonly now: string;
};

function addUtcDays(isoNow: string, days: number): string {
  const date = new Date(isoNow);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString();
}

function resetToDue(now: string): ReviewQueueItemState {
  return {
    status: "due",
    intervalStage: 0,
    consecutiveCorrect: 0,
    dueAt: now,
  };
}

function suspend(current: ReviewQueueItemState | null, now: string): ReviewQueueItemState {
  return {
    status: "suspended",
    intervalStage: current?.intervalStage ?? 0,
    consecutiveCorrect: current?.consecutiveCorrect ?? 0,
    dueAt: current?.dueAt ?? now,
  };
}

/**
 * Pure schedule / upsert policy for the mistake review queue.
 * `now` must be an ISO-8601 UTC instant; tests inject a fake clock.
 */
export function applyReviewTransition(input: ReviewTransitionInput): ReviewQueueItemState | null {
  const { mode, isCorrect, approvedExerciseAvailable, current, now } = input;

  if (mode === "practice") {
    if (isCorrect) {
      return null;
    }

    if (!approvedExerciseAvailable) {
      return suspend(current, now);
    }

    return resetToDue(now);
  }

  // review mode
  if (!approvedExerciseAvailable) {
    return suspend(current, now);
  }

  if (!isCorrect) {
    return resetToDue(now);
  }

  const stage = current?.intervalStage ?? 0;
  const consecutive = (current?.consecutiveCorrect ?? 0) + 1;

  if (stage >= REVIEW_MAX_STAGE) {
    return {
      status: "mastered",
      intervalStage: REVIEW_MAX_STAGE,
      consecutiveCorrect: consecutive,
      dueAt: null,
    };
  }

  const days = [1, 3, 7][stage]!;

  return {
    status: "scheduled",
    intervalStage: stage + 1,
    consecutiveCorrect: consecutive,
    dueAt: addUtcDays(now, days),
  };
}

export function isDueForReview(item: ReviewQueueItemState, now: string): boolean {
  if (item.status === "due") {
    return true;
  }

  if (item.status === "scheduled" && item.dueAt !== null) {
    return item.dueAt <= now;
  }

  return false;
}

export function compareReviewQueueOrder(
  left: { readonly dueAt: string | null; readonly createdAt: string; readonly id: string },
  right: { readonly dueAt: string | null; readonly createdAt: string; readonly id: string },
): number {
  const leftDue = left.dueAt ?? "";
  const rightDue = right.dueAt ?? "";

  if (leftDue !== rightDue) {
    return leftDue < rightDue ? -1 : 1;
  }

  if (left.createdAt !== right.createdAt) {
    return left.createdAt < right.createdAt ? -1 : 1;
  }

  return left.id < right.id ? -1 : 1;
}

export type ReviewQueueItem = ReviewQueueItemState & {
  readonly id: string;
  readonly userId: string;
  readonly moduleId: string;
  readonly conceptKey: string;
  readonly exerciseId: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type ReviewQueueSummary = {
  readonly dueCount: number;
  readonly scheduledCount: number;
  readonly masteredCount: number;
  readonly suspendedCount: number;
  readonly dueItems: readonly ReviewQueueItem[];
};
