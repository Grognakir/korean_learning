import { describe, expect, it } from "vitest";

import {
  applyReviewTransition,
  compareReviewQueueOrder,
  isDueForReview,
  type ReviewQueueItemState,
} from "./reviewPolicy";

const NOW = "2026-08-09T12:00:00.000Z";

function dueItem(overrides: Partial<ReviewQueueItemState> = {}): ReviewQueueItemState {
  return {
    status: "due",
    intervalStage: 0,
    consecutiveCorrect: 0,
    dueAt: NOW,
    ...overrides,
  };
}

describe("applyReviewTransition", () => {
  it("creates a due item on practice wrong", () => {
    expect(
      applyReviewTransition({
        mode: "practice",
        isCorrect: false,
        approvedExerciseAvailable: true,
        current: null,
        now: NOW,
      }),
    ).toEqual(dueItem());
  });

  it("upserts practice wrong without advancing stage", () => {
    expect(
      applyReviewTransition({
        mode: "practice",
        isCorrect: false,
        approvedExerciseAvailable: true,
        current: {
          status: "scheduled",
          intervalStage: 2,
          consecutiveCorrect: 2,
          dueAt: "2026-08-12T12:00:00.000Z",
        },
        now: NOW,
      }),
    ).toEqual(dueItem());
  });

  it("ignores practice correct", () => {
    expect(
      applyReviewTransition({
        mode: "practice",
        isCorrect: true,
        approvedExerciseAvailable: true,
        current: dueItem(),
        now: NOW,
      }),
    ).toBeNull();
  });

  it("advances review correct through the fixed schedule to mastered", () => {
    const stage0 = applyReviewTransition({
      mode: "review",
      isCorrect: true,
      approvedExerciseAvailable: true,
      current: dueItem(),
      now: NOW,
    });
    expect(stage0).toEqual({
      status: "scheduled",
      intervalStage: 1,
      consecutiveCorrect: 1,
      dueAt: "2026-08-10T12:00:00.000Z",
    });

    const stage1 = applyReviewTransition({
      mode: "review",
      isCorrect: true,
      approvedExerciseAvailable: true,
      current: stage0!,
      now: "2026-08-10T12:00:00.000Z",
    });
    expect(stage1).toEqual({
      status: "scheduled",
      intervalStage: 2,
      consecutiveCorrect: 2,
      dueAt: "2026-08-13T12:00:00.000Z",
    });

    const stage2 = applyReviewTransition({
      mode: "review",
      isCorrect: true,
      approvedExerciseAvailable: true,
      current: stage1!,
      now: "2026-08-13T12:00:00.000Z",
    });
    expect(stage2).toEqual({
      status: "scheduled",
      intervalStage: 3,
      consecutiveCorrect: 3,
      dueAt: "2026-08-20T12:00:00.000Z",
    });

    const mastered = applyReviewTransition({
      mode: "review",
      isCorrect: true,
      approvedExerciseAvailable: true,
      current: stage2!,
      now: "2026-08-20T12:00:00.000Z",
    });
    expect(mastered).toEqual({
      status: "mastered",
      intervalStage: 3,
      consecutiveCorrect: 4,
      dueAt: null,
    });
  });

  it("resets every review stage on wrong", () => {
    for (const stage of [0, 1, 2, 3]) {
      expect(
        applyReviewTransition({
          mode: "review",
          isCorrect: false,
          approvedExerciseAvailable: true,
          current: {
            status: stage === 0 ? "due" : "scheduled",
            intervalStage: stage,
            consecutiveCorrect: stage,
            dueAt: NOW,
          },
          now: NOW,
        }),
      ).toEqual(dueItem());
    }
  });

  it("reactivates a mastered concept after a new practice wrong", () => {
    expect(
      applyReviewTransition({
        mode: "practice",
        isCorrect: false,
        approvedExerciseAvailable: true,
        current: {
          status: "mastered",
          intervalStage: 3,
          consecutiveCorrect: 4,
          dueAt: null,
        },
        now: NOW,
      }),
    ).toEqual(dueItem());
  });

  it("suspends when the approved exercise is unavailable", () => {
    expect(
      applyReviewTransition({
        mode: "practice",
        isCorrect: false,
        approvedExerciseAvailable: false,
        current: dueItem({ intervalStage: 1, consecutiveCorrect: 1 }),
        now: NOW,
      }),
    ).toEqual({
      status: "suspended",
      intervalStage: 1,
      consecutiveCorrect: 1,
      dueAt: NOW,
    });
  });
});

describe("isDueForReview", () => {
  it("includes due and scheduled items whose dueAt is not in the future", () => {
    expect(isDueForReview(dueItem(), NOW)).toBe(true);
    expect(
      isDueForReview(
        { status: "scheduled", intervalStage: 1, consecutiveCorrect: 1, dueAt: NOW },
        NOW,
      ),
    ).toBe(true);
    expect(
      isDueForReview(
        {
          status: "scheduled",
          intervalStage: 1,
          consecutiveCorrect: 1,
          dueAt: "2026-08-10T12:00:00.000Z",
        },
        NOW,
      ),
    ).toBe(false);
    expect(
      isDueForReview(
        { status: "mastered", intervalStage: 3, consecutiveCorrect: 4, dueAt: null },
        NOW,
      ),
    ).toBe(false);
  });
});

describe("compareReviewQueueOrder", () => {
  it("orders by dueAt, then createdAt, then id", () => {
    const items = [
      { id: "b", dueAt: "2026-08-09T12:00:00.000Z", createdAt: "2026-08-01T00:00:00.000Z" },
      { id: "a", dueAt: "2026-08-09T12:00:00.000Z", createdAt: "2026-08-01T00:00:00.000Z" },
      { id: "c", dueAt: "2026-08-08T12:00:00.000Z", createdAt: "2026-08-02T00:00:00.000Z" },
    ];

    const sorted = [...items].sort(compareReviewQueueOrder);
    expect(sorted.map((item) => item.id)).toEqual(["c", "a", "b"]);
  });
});
