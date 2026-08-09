import { describe, expect, it } from "vitest";

import { filterReviewQueueItems } from "./filterReviewItems";
import type { ReviewQueueItem } from "./reviewPolicy";

function item(
  partial: Partial<ReviewQueueItem> & Pick<ReviewQueueItem, "conceptKey" | "moduleId">,
): ReviewQueueItem {
  return {
    id: partial.id ?? "id",
    userId: partial.userId ?? "user",
    moduleId: partial.moduleId,
    conceptKey: partial.conceptKey,
    exerciseId: partial.exerciseId ?? null,
    status: partial.status ?? "due",
    intervalStage: partial.intervalStage ?? 0,
    consecutiveCorrect: partial.consecutiveCorrect ?? 0,
    dueAt: partial.dueAt ?? "2026-08-10T00:00:00.000Z",
    createdAt: partial.createdAt ?? "2026-08-10T00:00:00.000Z",
    updatedAt: partial.updatedAt ?? "2026-08-10T00:00:00.000Z",
  };
}

describe("filterReviewQueueItems", () => {
  const items = [
    item({ conceptKey: "grammar:gt-u01-01", moduleId: "mod-u01" }),
    item({ conceptKey: "vocabulary:de-hello", moduleId: "mod-u01" }),
    item({ conceptKey: "reading:rp-u01", moduleId: "mod-u02" }),
    item({ conceptKey: "write-greeting", moduleId: "mod-sample" }),
  ];

  it("filters by skill and keeps legacy rows", () => {
    const filtered = filterReviewQueueItems(items, { skill: "vocabulary" });
    expect(filtered.map((row) => row.conceptKey)).toEqual([
      "vocabulary:de-hello",
      "write-greeting",
    ]);
  });

  it("filters by module", () => {
    const filtered = filterReviewQueueItems(items, { moduleId: "mod-u01" });
    expect(filtered).toHaveLength(2);
  });

  it("combines skill and module filters", () => {
    const filtered = filterReviewQueueItems(items, {
      skill: "grammar",
      moduleId: "mod-u01",
    });
    expect(filtered.map((row) => row.conceptKey)).toEqual(["grammar:gt-u01-01"]);
  });
});
