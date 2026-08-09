import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ModuleProgressCard } from "./ModuleProgressCard";

describe("ModuleProgressCard", () => {
  it("shows module stats and topic rows with accessible names", () => {
    render(
      <ModuleProgressCard
        module={{
          moduleId: "ad66b9f8-61b6-4fd0-9e98-6ec426547dd0",
          moduleSlug: "sample-module",
          titleRu: "Первые шаги",
          titleKo: "한국어",
          level: "1급",
          attemptsCount: 4,
          correctCount: 3,
          accuracy: 0.75,
          completedSessions: 1,
          masteryStatus: "learning",
          lastPracticedAt: "2026-08-09T10:00:00.000Z",
          skills: [
            {
              skill: "grammar",
              attemptsCount: 4,
              correctCount: 3,
              accuracy: 0.75,
              masteryStatus: "learning",
              lastPracticedAt: "2026-08-09T10:00:00.000Z",
            },
            {
              skill: "vocabulary",
              attemptsCount: 0,
              correctCount: 0,
              accuracy: 0,
              masteryStatus: "not_started",
              lastPracticedAt: null,
            },
            {
              skill: "reading",
              attemptsCount: 0,
              correctCount: 0,
              accuracy: 0,
              masteryStatus: "not_started",
              lastPracticedAt: null,
            },
          ],
          topics: [
            {
              topicId: "topic-a",
              code: "hangul",
              titleRu: "Основы хангыля",
              attemptsCount: 3,
              correctCount: 3,
              accuracy: 1,
              masteryStatus: "practiced",
              lastPracticedAt: "2026-08-09T10:00:00.000Z",
            },
          ],
        }}
      />,
    );

    expect(screen.getByRole("article", { name: /Первые шаги/i })).toBeInTheDocument();
    expect(screen.getByText("75%")).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Прогресс по навыкам" })).toBeInTheDocument();
    expect(screen.getByText("Грамматика")).toBeInTheDocument();
    expect(screen.getByText("Основы хангыля")).toBeInTheDocument();
    expect(screen.getByText("Практиковано")).toBeInTheDocument();
  });
});
