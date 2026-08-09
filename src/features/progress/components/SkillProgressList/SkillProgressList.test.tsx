import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SkillProgressList } from "./SkillProgressList";

describe("SkillProgressList", () => {
  it("exposes accuracy progressbars with accessible names and values", () => {
    render(
      <SkillProgressList
        skills={[
          {
            skill: "grammar",
            attemptsCount: 4,
            correctCount: 3,
            accuracy: 0.75,
            masteryStatus: "learning",
            lastPracticedAt: "2026-08-10T00:00:00.000Z",
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
        ]}
      />,
    );

    expect(screen.getByRole("region", { name: "Прогресс по навыкам" })).toBeInTheDocument();
    const grammarBar = screen.getByRole("progressbar", {
      name: "Точность навыка Грамматика: 75%",
    });
    expect(grammarBar).toHaveAttribute("aria-valuenow", "75");
    expect(grammarBar).toHaveAttribute("aria-valuemax", "100");

    expect(
      screen.getByRole("progressbar", { name: "Точность навыка Словарь: 0%" }),
    ).toHaveAttribute("aria-valuenow", "0");
  });
});
