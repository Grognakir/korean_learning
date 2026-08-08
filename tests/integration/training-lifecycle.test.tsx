import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import {
  LocalTrainingSessionStore,
  TrainingSession,
  buildTrainingResultSnapshot,
  createMistakeRetrySessionConfig,
  createTrainingSession,
  selectCurrentExerciseId,
  selectMistakeExerciseIds,
  submitTrainingAnswer,
  trainingSessionReducer,
  type Exercise,
} from "@/features/training";

import { createChoiceExercise, createExercisePair } from "../factories/exerciseFactory";
import { createTestModule } from "../factories/moduleFactory";
import { createActiveSession } from "../factories/sessionFactory";
import {
  createFixedClock,
  createMemoryStorage,
  createSubmissionIdFactory,
} from "../helpers/integration";

function correctChoice(exercise: Extract<Exercise, { type: "meaning-choice" }>) {
  return {
    exerciseId: exercise.id,
    type: exercise.type,
    optionId: exercise.correctOptionId,
  } as const;
}

function incorrectChoice(exercise: Extract<Exercise, { type: "meaning-choice" }>) {
  const wrong = exercise.options.find((option) => option.id !== exercise.correctOptionId)!;
  return {
    exerciseId: exercise.id,
    type: exercise.type,
    optionId: wrong.id,
  } as const;
}

describe("training lifecycle integration", () => {
  it("runs start → mixed answers → complete → result snapshot", () => {
    const [home, school] = createExercisePair();
    const learningModule = createTestModule();
    let state = createActiveSession([home, school], { seed: 3 });
    const createSubmissionId = createSubmissionIdFactory();

    const firstId = selectCurrentExerciseId(state)!;
    const first = firstId === home.id ? home : school;
    state = submitTrainingAnswer(state, {
      exercise: first,
      submission: incorrectChoice(first),
      submissionId: createSubmissionId(),
      occurredAt: "2026-08-08T10:01:00.000Z",
    });
    state = trainingSessionReducer(state, {
      type: "next",
      occurredAt: "2026-08-08T10:01:30.000Z",
    });

    const secondId = selectCurrentExerciseId(state)!;
    const second = secondId === home.id ? home : school;
    state = submitTrainingAnswer(state, {
      exercise: second,
      submission: correctChoice(second),
      submissionId: createSubmissionId(),
      occurredAt: "2026-08-08T10:02:00.000Z",
    });
    state = trainingSessionReducer(state, {
      type: "next",
      occurredAt: "2026-08-08T10:02:30.000Z",
    });

    expect(state.status).toBe("completed");
    const snapshot = buildTrainingResultSnapshot(
      state,
      new Map([
        [home.id, home],
        [school.id, school],
      ]),
      { topics: learningModule.topics },
    );

    expect(snapshot.correctCount).toBe(1);
    expect(snapshot.totalCount).toBe(2);
    expect(snapshot.mistakeExerciseIds).toEqual([first.id]);
    expect(snapshot.mistakes[0]?.reasonCode).toBe("incorrect");
    expect(snapshot.topics).toHaveLength(2);
  });

  it("retries mistakes in original order and completes the review session", () => {
    const [home, school] = createExercisePair();
    let state = createActiveSession([home, school], { seed: 11 });
    const createSubmissionId = createSubmissionIdFactory("retry-sub");

    while (state.status === "active") {
      const currentId = selectCurrentExerciseId(state)!;
      const exercise = currentId === home.id ? home : school;
      state = submitTrainingAnswer(state, {
        exercise,
        submission: incorrectChoice(exercise),
        submissionId: createSubmissionId(),
        occurredAt: "2026-08-08T11:00:00.000Z",
      });
      state = trainingSessionReducer(state, {
        type: "next",
        occurredAt: "2026-08-08T11:00:30.000Z",
      });
    }

    const mistakeIds = selectMistakeExerciseIds(state);
    expect(mistakeIds).toEqual(state.attempts.map((attempt) => attempt.exerciseId));

    let retry = createTrainingSession(
      createMistakeRetrySessionConfig({
        sessionId: "integration-retry",
        moduleSlug: home.moduleSlug,
        mistakeExerciseIds: mistakeIds,
        contentVersion: "1.0.0",
        startedAt: "2026-08-08T11:10:00.000Z",
        seed: 99,
      }),
    );

    expect(retry.mode).toBe("review");
    expect(retry.queue).toEqual(mistakeIds);

    while (retry.status === "active") {
      const currentId = selectCurrentExerciseId(retry)!;
      const exercise = currentId === home.id ? home : school;
      retry = submitTrainingAnswer(retry, {
        exercise,
        submission: correctChoice(exercise),
        submissionId: createSubmissionId(),
        occurredAt: "2026-08-08T11:11:00.000Z",
      });
      retry = trainingSessionReducer(retry, {
        type: "next",
        occurredAt: "2026-08-08T11:11:30.000Z",
      });
    }

    const snapshot = buildTrainingResultSnapshot(
      retry,
      new Map([
        [home.id, home],
        [school.id, school],
      ]),
    );
    expect(snapshot.correctCount).toBe(2);
    expect(snapshot.mistakeExerciseIds).toEqual([]);
  });

  it("completes a short UI session and offers result actions", async () => {
    const user = userEvent.setup();
    const [home] = createExercisePair();
    const learningModule = createTestModule();
    const createSubmissionId = createSubmissionIdFactory("ui");

    render(
      <TrainingSession
        contentVersion="1.0.0"
        createSubmissionId={createSubmissionId}
        exercises={[home]}
        moduleSlug={home.moduleSlug}
        now={() => "2026-08-08T12:00:00.000Z"}
        persist={false}
        seed={1}
        sessionId="ui-lifecycle"
        topics={learningModule.topics}
      />,
    );

    await user.click(screen.getByLabelText("дом"));
    await user.click(screen.getByRole("button", { name: "Ответить" }));
    await user.click(screen.getByRole("button", { name: "Дальше" }));

    expect(screen.getByRole("heading", { name: "Тренировка завершена" })).toBeInTheDocument();
    expect(screen.getByLabelText("Процент успеха: 100")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Повторить ошибки" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Новая тренировка" })).toHaveAttribute(
      "href",
      "/training",
    );
  });

  it("keeps seeded queues deterministic across creates", () => {
    const [home, school] = createExercisePair();
    const third = createChoiceExercise({
      id: "22222222-2222-4222-8222-222222222203",
      logicalId: "integration-third",
      prompt: { ko: "친구", ru: "Выберите значение." },
      options: [
        { id: "friend", label: { ko: null, ru: "друг" } },
        { id: "person", label: { ko: null, ru: "человек" } },
      ],
      correctOptionId: "friend",
    });
    const exercises = [home, school, third];
    const first = createActiveSession(exercises, { seed: 42 });
    const second = createActiveSession(exercises, { seed: 42 });
    const other = createActiveSession(exercises, { seed: 7 });

    expect(first.queue).toEqual(second.queue);
    expect(first.queue).not.toEqual(other.queue);
  });
});

describe("training persistence boundary", () => {
  it("clears active storage after UI completion", async () => {
    const user = userEvent.setup();
    const [home] = createExercisePair();
    const learningModule = createTestModule();
    const storage = createMemoryStorage();
    const store = new LocalTrainingSessionStore({
      storage,
      clock: createFixedClock(),
    });
    const createSubmissionId = createSubmissionIdFactory("persist-ui");

    render(
      <TrainingSession
        contentVersion="1.0.0"
        createSubmissionId={createSubmissionId}
        exercises={[home]}
        moduleSlug={home.moduleSlug}
        now={() => "2026-08-08T12:00:00.000Z"}
        persist
        seed={1}
        sessionId="persist-complete"
        store={store}
        topics={learningModule.topics}
      />,
    );

    await waitFor(() => {
      expect(screen.getByLabelText("дом")).toBeInTheDocument();
    });

    await user.click(screen.getByLabelText("дом"));
    await user.click(screen.getByRole("button", { name: "Ответить" }));
    await user.click(screen.getByRole("button", { name: "Дальше" }));

    expect(screen.getByRole("heading", { name: "Тренировка завершена" })).toBeInTheDocument();
    await waitFor(() => {
      expect(Object.keys(storage.snapshot())).toHaveLength(0);
    });
  });
});
