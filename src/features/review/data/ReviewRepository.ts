import type { ReviewQueueItem, ReviewQueueSummary } from "../domain";

export type ReviewRepository = {
  readonly getSummaryForUser: (userId: string, now?: string) => Promise<ReviewQueueSummary>;
  readonly listDueItems: (userId: string, now?: string) => Promise<readonly ReviewQueueItem[]>;
};
