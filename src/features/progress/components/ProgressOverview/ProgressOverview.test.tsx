import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ProgressOverview } from "./ProgressOverview";

describe("ProgressOverview", () => {
  it("renders module cards in a labeled section", () => {
    render(
      <ProgressOverview
        overview={{
          modules: [
            {
              moduleId: "module-1",
              moduleSlug: "sample-module",
              titleRu: "Первые шаги",
              titleKo: "한국어",
              level: "1급",
              attemptsCount: 0,
              correctCount: 0,
              accuracy: 0,
              completedSessions: 0,
              masteryStatus: "not_started",
              lastPracticedAt: null,
              topics: [],
            },
          ],
        }}
      />,
    );

    expect(screen.getByRole("region", { name: "Прогресс по модулям" })).toBeInTheDocument();
    expect(screen.getByText("Первые шаги")).toBeInTheDocument();
  });
});
