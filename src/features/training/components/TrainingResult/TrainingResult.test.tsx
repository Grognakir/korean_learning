import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import type { TrainingResultSnapshot } from "../../domain";

import { TrainingResult } from "./TrainingResult";

const baseSnapshot: TrainingResultSnapshot = {
  sessionId: "demo",
  moduleSlug: "sample-module",
  completedAt: "2026-08-08T12:00:00.000Z",
  correctCount: 1,
  totalCount: 2,
  score: 1,
  maxScore: 2,
  percentage: 50,
  topics: [
    {
      topicId: "topic-1",
      title: { ko: "첫 표현", ru: "Первые выражения" },
      correctCount: 1,
      gradedCount: 2,
      score: 1,
      maxScore: 2,
    },
  ],
  mistakes: [
    {
      exerciseId: "ex-1",
      prompt: { ko: "집", ru: "Что значит это слово?" },
      userAnswerLabel: "школа",
      canonicalAnswerLabel: "дом",
      explanation: { ko: null, ru: "집 значит дом." },
      reasonCode: "incorrect",
    },
  ],
  mistakeExerciseIds: ["ex-1"],
};

describe("TrainingResult", () => {
  it("renders score, topics, mistakes and both actions", async () => {
    const user = userEvent.setup();
    const onRetryMistakes = vi.fn();

    render(<TrainingResult onRetryMistakes={onRetryMistakes} snapshot={baseSnapshot} />);

    expect(screen.getByRole("heading", { name: "Тренировка завершена" })).toBeInTheDocument();
    expect(screen.getByText("Верных ответов").closest("div")).toHaveTextContent("1 из 2");
    expect(screen.getByText("Баллы").closest("div")).toHaveTextContent("1 из 2");
    expect(screen.getByLabelText("Процент успеха: 50")).toHaveTextContent("50%");
    expect(screen.getByText("Первые выражения")).toBeInTheDocument();
    expect(screen.getByText("Ваш ответ").closest("div")).toHaveTextContent("школа");
    expect(screen.getByText("Правильный ответ").closest("div")).toHaveTextContent("дом");
    expect(screen.getByRole("link", { name: "Новая тренировка" })).toHaveAttribute(
      "href",
      "/training",
    );

    await user.click(screen.getByRole("button", { name: "Повторить ошибки" }));
    expect(onRetryMistakes).toHaveBeenCalledOnce();
  });

  it("hides retry when there are no mistakes", () => {
    render(
      <TrainingResult
        snapshot={{
          ...baseSnapshot,
          correctCount: 2,
          percentage: 100,
          mistakes: [],
          mistakeExerciseIds: [],
        }}
      />,
    );

    expect(screen.getByText("Ошибок нет — отличный результат.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Повторить ошибки" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Новая тренировка" })).toBeInTheDocument();
  });
});
