import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { sampleExercises } from "@/modules/sample";

import type { UseCloudTrainingPersistenceResult } from "../../hooks/useCloudTrainingPersistence";
import { toPublicExercises } from "../../presentation";
import { createLocalEvaluateSubmission } from "../../testing/createLocalEvaluateSubmission";
import { TrainingSession } from "./TrainingSession";

const cloudState: UseCloudTrainingPersistenceResult = {
  serverSessionId: null,
  syncStatus: "starting",
  syncMessage: "Подключение к серверу…",
  evaluateSubmission: vi.fn(),
  retryStart: vi.fn(),
  completeSession: vi.fn(async () => undefined),
};

vi.mock("../../hooks/useCloudTrainingPersistence", () => ({
  useCloudTrainingPersistence: () => cloudState,
}));

describe("TrainingSession cloud bootstrap", () => {
  it("keeps the exercise shell visible while cloud session starts", () => {
    render(
      <TrainingSession
        cloudPersistence={{
          moduleId: "module-1",
          clientSessionKey: "demo-session",
          contentVersion: "1.0.0",
          exerciseIds: sampleExercises.map((exercise) => exercise.id),
          randomSeed: "17",
        }}
        evaluateSubmission={createLocalEvaluateSubmission(sampleExercises)}
        persist={false}
        publicExercises={toPublicExercises(sampleExercises, { seed: 1 })}
        seed={1}
      />,
    );

    expect(screen.getByRole("progressbar")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2 })).toBeInTheDocument();
    expect(screen.getByText("Подключение к серверу…")).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Синхронизация сессии" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Ответить" })).toBeDisabled();
  });
});
