import { describe, expect, it } from "vitest";

import { sampleExercises, sampleModule } from "@/modules/sample";
import type { Exercise } from "../exercise";
import { toPublicExercise } from "../../presentation";
import type { PublicExercise } from "../../presentation";
import { createTrainingSession } from "./createTrainingSession";
import { buildTrainingResultSnapshot, createMistakeRetrySessionConfig } from "./resultSnapshot";
import { submitTrainingAnswerForExercise } from "./submitTrainingAnswer";
import { trainingSessionReducer } from "./trainingSessionReducer";
import type { TrainingSessionConfig } from "./types";

function publicExercisesById(exercises: readonly Exercise[]): Map<string, PublicExercise> {
  return new Map(exercises.map((exercise) => [exercise.id, toPublicExercise(exercise)]));
}

function exerciseByLogicalId(logicalId: string): Exercise {
  const exercise = sampleExercises.find((item) => item.logicalId === logicalId);
  if (!exercise) {
    throw new Error(`Missing sample exercise: ${logicalId}`);
  }

  return exercise;
}

function correctSubmission(exercise: Exercise) {
  switch (exercise.type) {
    case "free-response":
      return {
        exerciseId: exercise.id,
        type: exercise.type,
        answer: exercise.acceptedAnswers.find((answer) => answer.isCanonical)!.value,
      } as const;
    case "meaning-choice":
    case "honorific-choice":
    case "plain-choice":
      return {
        exerciseId: exercise.id,
        type: exercise.type,
        optionId: exercise.correctOptionId,
      } as const;
    case "fill-blank":
      return {
        exerciseId: exercise.id,
        type: exercise.type,
        answers: exercise.blanks.map((blank) => ({
          blankId: blank.id,
          answer: blank.acceptedAnswers.find((answer) => answer.isCanonical)!.value,
        })),
      } as const;
    case "matching-translation":
    case "matching-honorific":
      return {
        exerciseId: exercise.id,
        type: exercise.type,
        matches: exercise.pairs.map((pair) => ({
          leftPairId: pair.id,
          rightPairId: pair.id,
        })),
      } as const;
  }
}

function incorrectSubmission(exercise: Exercise) {
  switch (exercise.type) {
    case "free-response":
      return {
        exerciseId: exercise.id,
        type: exercise.type,
        answer: "틀림",
      } as const;
    case "meaning-choice":
    case "honorific-choice":
    case "plain-choice": {
      const wrong = exercise.options.find((option) => option.id !== exercise.correctOptionId)!;
      return {
        exerciseId: exercise.id,
        type: exercise.type,
        optionId: wrong.id,
      } as const;
    }
    case "fill-blank":
      return {
        exerciseId: exercise.id,
        type: exercise.type,
        answers: exercise.blanks.map((blank) => ({
          blankId: blank.id,
          answer: "틀림",
        })),
      } as const;
    case "matching-translation":
    case "matching-honorific": {
      const first = exercise.pairs[0]!;
      const second = exercise.pairs[1] ?? first;
      return {
        exerciseId: exercise.id,
        type: exercise.type,
        matches: exercise.pairs.map((pair, index) => ({
          leftPairId: pair.id,
          rightPairId: index === 0 ? second.id : first.id,
        })),
      } as const;
    }
  }
}

function baseConfig(
  overrides: Partial<TrainingSessionConfig> &
    Pick<TrainingSessionConfig, "exerciseIds" | "startedAt">,
): TrainingSessionConfig {
  return {
    sessionId: "result-session",
    moduleSlug: "sample-module",
    mode: "practice",
    seed: 1,
    contentSnapshot: {
      contentVersion: "1.0.0",
      exerciseIds: overrides.exerciseIds,
    },
    ...overrides,
  };
}

function completeSession(
  exercises: readonly Exercise[],
  answers: ReadonlyMap<string, "correct" | "incorrect">,
) {
  let state = createTrainingSession(
    baseConfig({
      exerciseIds: exercises.map((exercise) => exercise.id),
      seed: 7,
      startedAt: "2026-08-08T00:00:00.000Z",
    }),
  );

  let step = 0;
  while (state.status === "active") {
    const currentId = state.queue[state.currentIndex]!;
    const exercise = exercises.find((item) => item.id === currentId)!;
    const kind = answers.get(exercise.id) ?? "correct";
    state = submitTrainingAnswerForExercise(state, {
      exercise,
      submission: kind === "correct" ? correctSubmission(exercise) : incorrectSubmission(exercise),
      submissionId: `sub-${step}`,
      occurredAt: `2026-08-08T00:0${step}:00.000Z`,
    });
    state = trainingSessionReducer(state, {
      type: "next",
      occurredAt: `2026-08-08T00:0${step}:30.000Z`,
    });
    step += 1;
  }

  return state;
}

describe("buildTrainingResultSnapshot", () => {
  const home = exerciseByLogicalId("choose-home-meaning");
  const school = exerciseByLogicalId("choose-school-meaning");
  const greeting = exerciseByLogicalId("write-greeting");

  it("builds an all-correct snapshot with percentage and topic breakdown", () => {
    const state = completeSession(
      [home, school],
      new Map([
        [home.id, "correct"],
        [school.id, "correct"],
      ]),
    );
    const exercisesById = publicExercisesById([home, school]);

    const snapshot = buildTrainingResultSnapshot(state, exercisesById, {
      topics: sampleModule.topics,
    });

    expect(snapshot.correctCount).toBe(2);
    expect(snapshot.totalCount).toBe(2);
    expect(snapshot.percentage).toBe(100);
    expect(snapshot.mistakes).toEqual([]);
    expect(snapshot.mistakeExerciseIds).toEqual([]);
    expect(snapshot.topics.length).toBeGreaterThan(0);
    expect(snapshot.topics.every((topic) => topic.gradedCount > 0)).toBe(true);
  });

  it("lists unique mistakes in attempt order with answer labels", () => {
    const state = completeSession(
      [home, school, greeting],
      new Map([
        [home.id, "incorrect"],
        [school.id, "correct"],
        [greeting.id, "incorrect"],
      ]),
    );
    const exercisesById = publicExercisesById([home, school, greeting]);

    const snapshot = buildTrainingResultSnapshot(state, exercisesById, {
      topics: sampleModule.topics,
    });

    expect(snapshot.correctCount).toBe(1);
    expect(snapshot.totalCount).toBe(3);
    expect(snapshot.percentage).toBeGreaterThanOrEqual(0);
    expect(snapshot.percentage).toBeLessThan(100);
    expect(snapshot.mistakeExerciseIds).toEqual(
      state.attempts.filter((attempt) => !attempt.evaluation.isCorrect).map((a) => a.exerciseId),
    );
    expect(snapshot.mistakes).toHaveLength(2);
    expect(snapshot.mistakes[0]?.userAnswerLabel.length).toBeGreaterThan(0);
    expect(snapshot.mistakes[0]?.canonicalAnswerLabel.length).toBeGreaterThan(0);
  });

  it("uses a safe topic fallback for unknown topic ids", () => {
    const orphan = {
      ...home,
      topicIds: ["missing-topic-id"],
    } satisfies Exercise;
    const state = completeSession([orphan], new Map([[orphan.id, "incorrect"]]));
    const snapshot = buildTrainingResultSnapshot(state, publicExercisesById([orphan]), {
      topics: sampleModule.topics,
    });

    expect(snapshot.topics).toEqual([
      expect.objectContaining({
        topicId: "missing-topic-id",
        title: {
          ko: "제목 없는 주제",
          ru: "Тема без названия",
        },
      }),
    ]);
  });

  it("rejects non-completed sessions", () => {
    const state = createTrainingSession(
      baseConfig({
        exerciseIds: [home.id],
        startedAt: "2026-08-08T00:00:00.000Z",
      }),
    );

    expect(() => buildTrainingResultSnapshot(state, publicExercisesById([home]))).toThrow(
      /completed session/,
    );
  });

  it("preserves mistake order in review retry config", () => {
    const ids = [school.id, home.id, greeting.id];
    const config = createMistakeRetrySessionConfig({
      sessionId: "retry-1",
      moduleSlug: "sample-module",
      mistakeExerciseIds: ids,
      contentVersion: "1.0.0",
      startedAt: "2026-08-08T01:00:00.000Z",
      seed: 99,
    });
    const retry = createTrainingSession(config);

    expect(retry.mode).toBe("review");
    expect(retry.queue).toEqual(ids);
  });

  it("handles zero max score without dividing by zero", () => {
    const state = completeSession([home], new Map([[home.id, "correct"]]));
    const zeroScoreState = {
      ...state,
      attempts: state.attempts.map((attempt) => ({
        ...attempt,
        evaluation: {
          ...attempt.evaluation,
          score: 0,
          maxScore: 0,
          scoreRatio: 0,
        },
      })),
    };

    const snapshot = buildTrainingResultSnapshot(zeroScoreState, publicExercisesById([home]));
    expect(snapshot.percentage).toBe(0);
    expect(snapshot.maxScore).toBe(0);
  });
});
