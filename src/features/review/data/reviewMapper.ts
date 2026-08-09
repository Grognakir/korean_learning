import type { Database } from "@/types/database";

import type { ReviewQueueItem, ReviewQueueSummary } from "../domain";

export type ReviewQueueRow = Database["public"]["Tables"]["review_queue"]["Row"];

export class ReviewRepositoryError extends Error {
  readonly code = "REVIEW_REPOSITORY_ERROR" as const;

  constructor(message: string) {
    super(message);
    this.name = "ReviewRepositoryError";
  }
}

export function mapReviewQueueItem(row: ReviewQueueRow): ReviewQueueItem {
  return {
    id: row.id,
    userId: row.user_id,
    moduleId: row.module_id,
    conceptKey: row.concept_key,
    exerciseId: row.exercise_id,
    status: row.status,
    intervalStage: row.interval_stage,
    consecutiveCorrect: row.consecutive_correct,
    dueAt: row.due_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function buildReviewQueueSummary(
  rows: readonly ReviewQueueRow[],
  dueItems: readonly ReviewQueueItem[],
): ReviewQueueSummary {
  let scheduledCount = 0;
  let masteredCount = 0;
  let suspendedCount = 0;

  for (const row of rows) {
    switch (row.status) {
      case "scheduled":
        scheduledCount += 1;
        break;
      case "mastered":
        masteredCount += 1;
        break;
      case "suspended":
        suspendedCount += 1;
        break;
      default:
        break;
    }
  }

  return {
    dueCount: dueItems.length,
    scheduledCount,
    masteredCount,
    suspendedCount,
    dueItems,
  };
}
