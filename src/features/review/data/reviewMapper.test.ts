import { describe, expect, it } from "vitest";

import { buildReviewQueueSummary, mapReviewQueueItem } from "./reviewMapper";

const baseRow = {
  id: "11111111-1111-4111-8111-111111111111",
  user_id: "22222222-2222-4222-8222-222222222222",
  module_id: "ad66b9f8-61b6-4fd0-9e98-6ec426547dd0",
  exercise_id: "0f6808ba-3ce6-4c94-8d29-e2d52ca2c65a",
  concept_key: "write-greeting",
  status: "due" as const,
  due_at: "2026-08-09T12:00:00.000Z",
  interval_stage: 0,
  consecutive_correct: 0,
  last_attempt_id: null,
  created_at: "2026-08-09T11:00:00.000Z",
  updated_at: "2026-08-09T12:00:00.000Z",
};

describe("reviewMapper", () => {
  it("maps a queue row to the domain item", () => {
    expect(mapReviewQueueItem(baseRow)).toEqual({
      id: baseRow.id,
      userId: baseRow.user_id,
      moduleId: baseRow.module_id,
      conceptKey: "write-greeting",
      exerciseId: baseRow.exercise_id,
      status: "due",
      intervalStage: 0,
      consecutiveCorrect: 0,
      dueAt: baseRow.due_at,
      createdAt: baseRow.created_at,
      updatedAt: baseRow.updated_at,
    });
  });

  it("summarizes statuses without double-counting due items", () => {
    const summary = buildReviewQueueSummary(
      [
        baseRow,
        { ...baseRow, id: "33333333-3333-4333-8333-333333333333", status: "scheduled" },
        {
          ...baseRow,
          id: "44444444-4444-4444-8444-444444444444",
          status: "mastered",
          due_at: null,
        },
        { ...baseRow, id: "55555555-5555-4555-8555-555555555555", status: "suspended" },
      ],
      [mapReviewQueueItem(baseRow)],
    );

    expect(summary).toEqual({
      dueCount: 1,
      scheduledCount: 1,
      masteredCount: 1,
      suspendedCount: 1,
      dueItems: [mapReviewQueueItem(baseRow)],
    });
  });
});
