import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { sampleExercises } from "@/modules/sample";

import { createTrainingSession, evaluateAnswer, trainingSessionReducer } from "../../domain";
import { LocalTrainingSessionStore } from "../../persistence";
import { toPublicExercises } from "../../presentation";
import { createLocalEvaluateSubmission } from "../../testing/createLocalEvaluateSubmission";
import { TrainingSession } from "../TrainingSession";

function createMemoryStorage() {
  const data = new Map<string, string>();

  return {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => {
      data.set(key, value);
    },
    removeItem: (key: string) => {
      data.delete(key);
    },
  };
}

describe("TrainingSession persistence", () => {
  it("restores the current exercise after remount from local storage", async () => {
    const storage = createMemoryStorage();
    const store = new LocalTrainingSessionStore({
      storage,
      clock: { now: () => new Date("2026-08-08T00:00:00.000Z") },
    });
    const exercises = sampleExercises.slice(0, 2);
    let created = createTrainingSession({
      sessionId: "demo-session",
      moduleSlug: "sample-module",
      mode: "practice",
      seed: 1,
      exerciseIds: exercises.map((exercise) => exercise.id),
      startedAt: "2026-08-08T00:00:00.000Z",
      contentSnapshot: {
        contentVersion: "1.0.0",
        exerciseIds: exercises.map((exercise) => exercise.id),
      },
    });

    const currentId = created.queue[0]!;
    const current = exercises.find((item) => item.id === currentId)!;
    let submission;
    if (current.type === "free-response") {
      submission = {
        exerciseId: current.id,
        type: current.type,
        answer: current.acceptedAnswers[0]!.value,
      } as const;
    } else if (
      current.type === "meaning-choice" ||
      current.type === "honorific-choice" ||
      current.type === "plain-choice" ||
      current.type === "single-choice"
    ) {
      submission = {
        exerciseId: current.id,
        type: current.type,
        optionId: current.correctOptionId,
      } as const;
    } else {
      throw new Error(`Unsupported fixture type: ${current.type}`);
    }

    const evaluation = evaluateAnswer(current, submission);
    created = trainingSessionReducer(created, {
      type: "submit",
      submissionId: "s1",
      submission,
      evaluation,
      occurredAt: "2026-08-08T00:01:00.000Z",
    });
    created = trainingSessionReducer(created, {
      type: "next",
      occurredAt: "2026-08-08T00:02:00.000Z",
    });
    store.save(created);

    render(
      <TrainingSession
        contentVersion="1.0.0"
        evaluateSubmission={createLocalEvaluateSubmission(exercises)}
        moduleSlug="sample-module"
        publicExercises={toPublicExercises(exercises, { seed: 1 })}
        seed={1}
        sessionId="demo-session"
        store={store}
      />,
    );

    await waitFor(() => {
      expect(screen.queryByText("Загрузка сессии…")).not.toBeInTheDocument();
    });

    expect(screen.getByText(/Задание 2 из 2/)).toBeInTheDocument();
  });

  it("does not save while only rendering with persist disabled", async () => {
    const storage = createMemoryStorage();
    const store = new LocalTrainingSessionStore({
      storage,
      clock: { now: () => new Date("2026-08-08T00:00:00.000Z") },
    });

    render(
      <TrainingSession
        evaluateSubmission={createLocalEvaluateSubmission(sampleExercises.slice(0, 1))}
        persist={false}
        publicExercises={toPublicExercises(sampleExercises.slice(0, 1), { seed: 1 })}
        seed={1}
        store={store}
      />,
    );

    expect(await screen.findByRole("heading", { level: 2 })).toBeInTheDocument();
    expect(store.load()).toEqual({ status: "missing" });
  });
});
