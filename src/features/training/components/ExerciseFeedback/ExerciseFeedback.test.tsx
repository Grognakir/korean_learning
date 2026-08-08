import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { sampleExercises } from "@/modules/sample";

import { evaluateAnswer } from "../../domain";
import type { MeaningChoiceExercise, TrainingAttemptSnapshot } from "../../domain";
import { ExerciseFeedback } from "./ExerciseFeedback";

function getMeaningChoice(): MeaningChoiceExercise {
  const exercise = sampleExercises.find((item) => item.logicalId === "choose-home-meaning");
  if (!exercise || exercise.type !== "meaning-choice") {
    throw new Error("Expected meaning-choice sample exercise");
  }

  return exercise;
}

const choice = getMeaningChoice();

function attemptFor(isCorrect: boolean): TrainingAttemptSnapshot {
  const submission = {
    exerciseId: choice.id,
    type: choice.type,
    optionId: isCorrect ? choice.correctOptionId : "school",
  } as const;

  return {
    submissionId: "attempt-1",
    exerciseId: choice.id,
    submittedAt: "2026-08-08T00:00:00.000Z",
    submission,
    evaluation: evaluateAnswer(choice, submission),
  };
}

describe("ExerciseFeedback", () => {
  it("announces correct feedback with explanation in aria-live", () => {
    render(<ExerciseFeedback attempt={attemptFor(true)} />);

    expect(screen.getByRole("status")).toHaveAttribute("aria-live", "polite");
    expect(screen.getByText("Верно")).toBeInTheDocument();
    expect(screen.getByText(/집 означает/)).toBeInTheDocument();
  });

  it("announces incorrect feedback", () => {
    render(<ExerciseFeedback attempt={attemptFor(false)} />);

    expect(screen.getByRole("alert")).toHaveAttribute("aria-live", "assertive");
    expect(screen.getByText("Неверно")).toBeInTheDocument();
  });
});
