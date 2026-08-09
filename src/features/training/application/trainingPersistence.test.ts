import { describe, expect, it } from "vitest";

import {
  startTrainingSessionRequestSchema,
  submitTrainingAttemptRequestSchema,
} from "../api/schemas";
import { TrainingPersistenceError } from "./errors";

describe("training persistence schemas", () => {
  it("rejects spoofed evaluation fields in attempt requests", () => {
    const parsed = submitTrainingAttemptRequestSchema.safeParse({
      exerciseId: "0f6808ba-3ce6-4c94-8d29-e2d52ca2c65a",
      contentVersion: "1.0.0",
      idempotencyKey: "attempt-1",
      submission: {
        exerciseId: "0f6808ba-3ce6-4c94-8d29-e2d52ca2c65a",
        type: "plain-choice",
        optionId: "option-a",
      },
      isCorrect: true,
      score: 1,
    });

    expect(parsed.success).toBe(false);
  });

  it("accepts a valid start session payload", () => {
    const parsed = startTrainingSessionRequestSchema.safeParse({
      moduleId: "ad66b9f8-61b6-4fd0-9e98-6ec426547dd0",
      mode: "practice",
      contentVersion: "1.0.0",
      exerciseIds: ["0f6808ba-3ce6-4c94-8d29-e2d52ca2c65a"],
      idempotencyKey: "session-1",
      randomSeed: "seed-1",
    });

    expect(parsed.success).toBe(true);
  });
});

describe("TrainingPersistenceError", () => {
  it("maps unauthorized errors to 401", () => {
    const error = new TrainingPersistenceError("UNAUTHORIZED", "Authentication is required.", 401);
    expect(error.status).toBe(401);
  });
});
