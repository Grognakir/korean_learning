import { describe, expect, it } from "vitest";

import type { LearningModuleDefinition } from "@/types";

import { buildModuleProgressSnapshot } from "./progressMapper";

const sampleModule: LearningModuleDefinition = {
  id: "ad66b9f8-61b6-4fd0-9e98-6ec426547dd0",
  slug: "sample-module",
  title: { ko: "한국어", ru: "Первые шаги" },
  description: { ko: "한국어", ru: "Описание" },
  level: "1급",
  status: "published",
  contentVersion: "1.0.0",
  sortOrder: 10,
  supportedExerciseTypes: ["plain-choice"],
  topics: [
    {
      id: "topic-a",
      code: "topic-a",
      title: { ko: "A", ru: "Тема A" },
      summary: { ko: "A", ru: "Summary A" },
      level: "1급",
      status: "published",
      contentVersion: "1.0.0",
      sortOrder: 10,
    },
    {
      id: "topic-b",
      code: "topic-b",
      title: { ko: "B", ru: "Тема B" },
      summary: { ko: "B", ru: "Summary B" },
      level: "1급",
      status: "published",
      contentVersion: "1.0.0",
      sortOrder: 20,
    },
  ],
};

describe("buildModuleProgressSnapshot", () => {
  it("defaults missing rows to not_started", () => {
    const snapshot = buildModuleProgressSnapshot({
      module: sampleModule,
      topicRowsByTopicId: {},
    });

    expect(snapshot.masteryStatus).toBe("not_started");
    expect(snapshot.topics).toHaveLength(2);
    expect(snapshot.topics.every((topic) => topic.masteryStatus === "not_started")).toBe(true);
  });

  it("maps stored module and topic rows", () => {
    const snapshot = buildModuleProgressSnapshot({
      module: sampleModule,
      moduleRow: {
        attempts_count: 6,
        correct_count: 5,
        accuracy: 0.8333,
        completed_sessions: 1,
        mastery_status: "learning",
        last_practiced_at: "2026-08-09T10:00:00.000Z",
      },
      topicRowsByTopicId: {
        "topic-a": {
          attempts_count: 3,
          correct_count: 3,
          accuracy: 1,
          mastery_status: "practiced",
          last_practiced_at: "2026-08-09T10:00:00.000Z",
        },
      },
    });

    expect(snapshot.completedSessions).toBe(1);
    expect(snapshot.topics[0]?.masteryStatus).toBe("practiced");
    expect(snapshot.topics[1]?.masteryStatus).toBe("not_started");
  });
});
