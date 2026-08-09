import { describe, expect, it } from "vitest";

import { sampleExercises } from "@/modules/sample";
import type { Exercise } from "../exercise";
import { createTrainingSession } from "./createTrainingSession";
import { TrainingSessionError } from "./errors";
import {
  selectCurrentExerciseId,
  selectHasAnsweredCurrent,
  selectMistakeExerciseIds,
  selectProgress,
  selectResultSummary,
  selectScoreSummary,
} from "./selectors";
import { seededShuffle } from "./seededShuffle";
import { submitTrainingAnswerForExercise } from "./submitTrainingAnswer";
import { trainingSessionReducer } from "./trainingSessionReducer";
import type { TrainingSessionConfig, TrainingSessionState } from "./types";

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
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
    case "single-choice":
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
    case "plain-choice":
    case "single-choice": {
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
      const second = exercise.pairs[1]!;
      return {
        exerciseId: exercise.id,
        type: exercise.type,
        matches: [
          { leftPairId: first.id, rightPairId: second.id },
          { leftPairId: second.id, rightPairId: first.id },
          ...exercise.pairs.slice(2).map((pair) => ({
            leftPairId: pair.id,
            rightPairId: pair.id,
          })),
        ],
      } as const;
    }
  }
}

function baseConfig(
  overrides: Partial<TrainingSessionConfig> &
    Pick<TrainingSessionConfig, "exerciseIds" | "startedAt">,
): TrainingSessionConfig {
  return {
    sessionId: "session-1",
    moduleSlug: "sample-module",
    mode: "practice",
    seed: 42,
    contentSnapshot: {
      contentVersion: "1.0.0",
      exerciseIds: overrides.exerciseIds,
    },
    ...overrides,
  };
}

describe("seededShuffle", () => {
  it("is deterministic for the same seed and differs for another seed", () => {
    const input = ["a", "b", "c", "d", "e"];

    expect(seededShuffle(input, 7)).toEqual(seededShuffle(input, 7));
    expect(seededShuffle(input, 7)).not.toEqual(seededShuffle(input, 8));
    expect(input).toEqual(["a", "b", "c", "d", "e"]);
  });
});

describe("createTrainingSession", () => {
  it("rejects an empty queue", () => {
    expect(() =>
      createTrainingSession(baseConfig({ exerciseIds: [], startedAt: "2026-08-08T00:00:00.000Z" })),
    ).toThrowError(
      expect.objectContaining<Partial<TrainingSessionError>>({
        code: "empty-queue",
      }),
    );
  });

  it("creates a session with one exercise", () => {
    const exercise = exerciseByLogicalId("write-greeting");
    const state = createTrainingSession(
      baseConfig({
        exerciseIds: [exercise.id],
        startedAt: "2026-08-08T00:00:00.000Z",
      }),
    );

    expect(state.status).toBe("active");
    expect(state.queue).toEqual([exercise.id]);
    expect(state.currentIndex).toBe(0);
    expect(state.completedAt).toBeNull();
  });

  it("creates a deterministic queue for multiple exercises", () => {
    const ids = sampleExercises.slice(0, 5).map((exercise) => exercise.id);
    const first = createTrainingSession(
      baseConfig({ exerciseIds: ids, seed: 11, startedAt: "2026-08-08T00:00:00.000Z" }),
    );
    const second = createTrainingSession(
      baseConfig({ exerciseIds: ids, seed: 11, startedAt: "2026-08-08T00:00:00.000Z" }),
    );
    const third = createTrainingSession(
      baseConfig({ exerciseIds: ids, seed: 12, startedAt: "2026-08-08T00:00:00.000Z" }),
    );

    expect(first.queue).toEqual(second.queue);
    expect(first.queue).not.toEqual(third.queue);
  });

  it("applies limit when smaller, equal, or larger than input size", () => {
    const ids = sampleExercises.slice(0, 4).map((exercise) => exercise.id);

    expect(
      createTrainingSession(
        baseConfig({
          exerciseIds: ids,
          limit: 2,
          startedAt: "2026-08-08T00:00:00.000Z",
        }),
      ).queue,
    ).toHaveLength(2);

    expect(
      createTrainingSession(
        baseConfig({
          exerciseIds: ids,
          limit: 4,
          startedAt: "2026-08-08T00:00:00.000Z",
        }),
      ).queue,
    ).toHaveLength(4);

    expect(
      createTrainingSession(
        baseConfig({
          exerciseIds: ids,
          limit: 10,
          startedAt: "2026-08-08T00:00:00.000Z",
        }),
      ).queue,
    ).toHaveLength(4);
  });

  it("rejects duplicate exercise ids and invalid limit/seed", () => {
    const exercise = exerciseByLogicalId("write-greeting");

    expect(() =>
      createTrainingSession(
        baseConfig({
          exerciseIds: [exercise.id, exercise.id],
          startedAt: "2026-08-08T00:00:00.000Z",
        }),
      ),
    ).toThrowError(
      expect.objectContaining<Partial<TrainingSessionError>>({
        code: "duplicate-exercise-id",
      }),
    );

    expect(() =>
      createTrainingSession(
        baseConfig({
          exerciseIds: [exercise.id],
          limit: 0,
          startedAt: "2026-08-08T00:00:00.000Z",
        }),
      ),
    ).toThrowError(
      expect.objectContaining<Partial<TrainingSessionError>>({
        code: "invalid-limit",
      }),
    );

    expect(() =>
      createTrainingSession(
        baseConfig({
          exerciseIds: [exercise.id],
          seed: 1.5,
          startedAt: "2026-08-08T00:00:00.000Z",
        }),
      ),
    ).toThrowError(
      expect.objectContaining<Partial<TrainingSessionError>>({
        code: "invalid-seed",
      }),
    );
  });
});

describe("training session transitions", () => {
  const greeting = exerciseByLogicalId("write-greeting");
  const thanks = exerciseByLogicalId("write-thanks");
  const home = exerciseByLogicalId("choose-home-meaning");

  function createTwoStepSession(startedAt = "2026-08-08T00:00:00.000Z"): TrainingSessionState {
    return createTrainingSession(
      baseConfig({
        exerciseIds: [greeting.id, thanks.id],
        seed: 1,
        startedAt,
      }),
    );
  }

  it("submits correct and incorrect answers and updates score selectors", () => {
    let state = createTrainingSession(
      baseConfig({
        exerciseIds: [greeting.id, home.id],
        seed: 3,
        startedAt: "2026-08-08T00:00:00.000Z",
      }),
    );

    const firstId = selectCurrentExerciseId(state)!;
    const firstExercise = firstId === greeting.id ? greeting : home;
    state = submitTrainingAnswerForExercise(state, {
      exercise: firstExercise,
      submission: correctSubmission(firstExercise),
      submissionId: "sub-1",
      occurredAt: "2026-08-08T00:01:00.000Z",
    });

    expect(selectScoreSummary(state).correctCount).toBe(1);
    expect(selectHasAnsweredCurrent(state)).toBe(true);

    state = trainingSessionReducer(state, {
      type: "next",
      occurredAt: "2026-08-08T00:01:30.000Z",
    });

    const secondId = selectCurrentExerciseId(state)!;
    const secondExercise = secondId === greeting.id ? greeting : home;
    state = submitTrainingAnswerForExercise(state, {
      exercise: secondExercise,
      submission: incorrectSubmission(secondExercise),
      submissionId: "sub-2",
      occurredAt: "2026-08-08T00:02:00.000Z",
    });

    expect(selectScoreSummary(state).correctCount).toBe(1);
    expect(selectMistakeExerciseIds(state)).toEqual([secondExercise.id]);
  });

  it("rejects submit for a non-current exercise", () => {
    const state = createTwoStepSession();
    const currentId = selectCurrentExerciseId(state)!;
    const other = currentId === greeting.id ? thanks : greeting;

    expect(() =>
      submitTrainingAnswerForExercise(state, {
        exercise: other,
        submission: correctSubmission(other),
        submissionId: "sub-other",
        occurredAt: "2026-08-08T00:01:00.000Z",
      }),
    ).toThrowError(
      expect.objectContaining<Partial<TrainingSessionError>>({
        code: "exercise-not-current",
      }),
    );
  });

  it("returns the same state for a duplicate submissionId", () => {
    let state = createTwoStepSession();
    const currentId = selectCurrentExerciseId(state)!;
    const exercise = currentId === greeting.id ? greeting : thanks;

    state = submitTrainingAnswerForExercise(state, {
      exercise,
      submission: correctSubmission(exercise),
      submissionId: "dup",
      occurredAt: "2026-08-08T00:01:00.000Z",
    });
    const snapshot = clone(state);

    const again = submitTrainingAnswerForExercise(state, {
      exercise,
      submission: incorrectSubmission(exercise),
      submissionId: "dup",
      occurredAt: "2026-08-08T00:02:00.000Z",
    });

    expect(again).toEqual(snapshot);
    expect(again.attempts).toHaveLength(1);
  });

  it("rejects a second new submit for the current step", () => {
    let state = createTwoStepSession();
    const currentId = selectCurrentExerciseId(state)!;
    const exercise = currentId === greeting.id ? greeting : thanks;

    state = submitTrainingAnswerForExercise(state, {
      exercise,
      submission: correctSubmission(exercise),
      submissionId: "first",
      occurredAt: "2026-08-08T00:01:00.000Z",
    });

    expect(() =>
      submitTrainingAnswerForExercise(state, {
        exercise,
        submission: incorrectSubmission(exercise),
        submissionId: "second",
        occurredAt: "2026-08-08T00:02:00.000Z",
      }),
    ).toThrowError(
      expect.objectContaining<Partial<TrainingSessionError>>({
        code: "already-answered",
      }),
    );
  });

  it("rejects next before submit", () => {
    const state = createTwoStepSession();

    expect(() =>
      trainingSessionReducer(state, {
        type: "next",
        occurredAt: "2026-08-08T00:01:00.000Z",
      }),
    ).toThrowError(
      expect.objectContaining<Partial<TrainingSessionError>>({
        code: "answer-required-before-next",
      }),
    );
  });

  it("completes on the last next transition", () => {
    let state = createTrainingSession(
      baseConfig({
        exerciseIds: [greeting.id],
        startedAt: "2026-08-08T00:00:00.000Z",
      }),
    );

    state = submitTrainingAnswerForExercise(state, {
      exercise: greeting,
      submission: correctSubmission(greeting),
      submissionId: "only",
      occurredAt: "2026-08-08T00:01:00.000Z",
    });

    state = trainingSessionReducer(state, {
      type: "next",
      occurredAt: "2026-08-08T00:02:00.000Z",
    });

    expect(state.status).toBe("completed");
    expect(state.completedAt).toBe("2026-08-08T00:02:00.000Z");
    expect(selectResultSummary(state).correctCount).toBe(1);
  });

  it("supports abandon and blocks later transitions", () => {
    let state = createTwoStepSession();
    state = trainingSessionReducer(state, {
      type: "abandon",
      occurredAt: "2026-08-08T00:03:00.000Z",
    });

    expect(state.status).toBe("abandoned");
    expect(state.completedAt).toBeNull();

    expect(() =>
      trainingSessionReducer(state, {
        type: "next",
        occurredAt: "2026-08-08T00:04:00.000Z",
      }),
    ).toThrowError(
      expect.objectContaining<Partial<TrainingSessionError>>({
        code: "session-not-active",
      }),
    );
  });

  it("uses injected timestamps and remains JSON-serializable", () => {
    let state = createTwoStepSession("2026-08-08T10:00:00.000Z");
    const currentId = selectCurrentExerciseId(state)!;
    const exercise = currentId === greeting.id ? greeting : thanks;

    state = submitTrainingAnswerForExercise(state, {
      exercise,
      submission: correctSubmission(exercise),
      submissionId: "json-1",
      occurredAt: "2026-08-08T10:05:00.000Z",
    });

    expect(state.lastActivityAt).toBe("2026-08-08T10:05:00.000Z");

    const restored = JSON.parse(JSON.stringify(state)) as TrainingSessionState;
    expect(restored).toEqual(state);
  });

  it("does not mutate the previous state object", () => {
    const state = createTwoStepSession();
    const snapshot = clone(state);
    const currentId = selectCurrentExerciseId(state)!;
    const exercise = currentId === greeting.id ? greeting : thanks;

    submitTrainingAnswerForExercise(state, {
      exercise,
      submission: correctSubmission(exercise),
      submissionId: "immut",
      occurredAt: "2026-08-08T00:01:00.000Z",
    });

    expect(state).toEqual(snapshot);
  });

  it("exposes progress selectors", () => {
    let state = createTwoStepSession();
    expect(selectProgress(state)).toEqual({
      current: 1,
      total: 2,
      answeredCount: 0,
    });

    const currentId = selectCurrentExerciseId(state)!;
    const exercise = currentId === greeting.id ? greeting : thanks;
    state = submitTrainingAnswerForExercise(state, {
      exercise,
      submission: correctSubmission(exercise),
      submissionId: "progress-1",
      occurredAt: "2026-08-08T00:01:00.000Z",
    });

    expect(selectProgress(state).answeredCount).toBe(1);
  });

  it("runs create→submit→next→complete against sample exercises", () => {
    const exercises = [greeting, thanks, home];
    let state = createTrainingSession(
      baseConfig({
        exerciseIds: exercises.map((exercise) => exercise.id),
        seed: 99,
        startedAt: "2026-08-08T00:00:00.000Z",
      }),
    );

    const byId = new Map(exercises.map((exercise) => [exercise.id, exercise]));
    let step = 0;

    while (state.status === "active") {
      const exerciseId = selectCurrentExerciseId(state)!;
      const exercise = byId.get(exerciseId)!;
      state = submitTrainingAnswerForExercise(state, {
        exercise,
        submission: correctSubmission(exercise),
        submissionId: `script-${step}`,
        occurredAt: `2026-08-08T00:0${step + 1}:00.000Z`,
      });
      state = trainingSessionReducer(state, {
        type: "next",
        occurredAt: `2026-08-08T00:0${step + 1}:30.000Z`,
      });
      step += 1;
    }

    expect(state.status).toBe("completed");
    expect(selectResultSummary(state).correctCount).toBe(3);
    expect(selectMistakeExerciseIds(state)).toEqual([]);
  });
});
