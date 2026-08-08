import { describe, expect, it } from "vitest";

import {
  LocalTrainingSessionStore,
  TRAINING_SESSION_STORAGE_KEY,
  TRAINING_SESSION_STORAGE_VERSION,
  selectCurrentExerciseId,
  submitTrainingAnswer,
  trainingSessionReducer,
} from "@/features/training";

import { createExercisePair } from "../factories/exerciseFactory";
import { createActiveSession } from "../factories/sessionFactory";
import { createFixedClock, createMemoryStorage } from "../helpers/integration";

describe("session recovery integration", () => {
  it("persists after submit and restores the same index on hydrate", () => {
    const [home, school] = createExercisePair();
    const storage = createMemoryStorage();
    const store = new LocalTrainingSessionStore({
      storage,
      clock: createFixedClock("2026-08-08T12:00:00.000Z"),
    });

    let state = createActiveSession([home, school], {
      sessionId: "resume-session",
      seed: 5,
    });
    const currentId = selectCurrentExerciseId(state)!;
    const current = currentId === home.id ? home : school;

    state = submitTrainingAnswer(state, {
      exercise: current,
      submission: {
        exerciseId: current.id,
        type: current.type,
        optionId: current.correctOptionId,
      },
      submissionId: "sub-1",
      occurredAt: "2026-08-08T12:01:00.000Z",
    });

    expect(store.save(state).ok).toBe(true);

    const loaded = store.load({ contentVersion: "1.0.0" });
    expect(loaded.status).toBe("ok");
    if (loaded.status !== "ok") {
      return;
    }

    expect(loaded.record.sessionState.currentIndex).toBe(state.currentIndex);
    expect(loaded.record.sessionState.attempts).toHaveLength(1);
    expect(selectCurrentExerciseId(loaded.record.sessionState)).toBe(currentId);

    let continued = trainingSessionReducer(loaded.record.sessionState, {
      type: "next",
      occurredAt: "2026-08-08T12:02:00.000Z",
    });
    const nextId = selectCurrentExerciseId(continued)!;
    const next = nextId === home.id ? home : school;
    continued = submitTrainingAnswer(continued, {
      exercise: next,
      submission: {
        exerciseId: next.id,
        type: next.type,
        optionId: next.correctOptionId,
      },
      submissionId: "sub-2",
      occurredAt: "2026-08-08T12:03:00.000Z",
    });
    continued = trainingSessionReducer(continued, {
      type: "next",
      occurredAt: "2026-08-08T12:04:00.000Z",
    });

    expect(continued.status).toBe("completed");
  });

  it("drops resume state on contentVersion mismatch", () => {
    const [home] = createExercisePair();
    const storage = createMemoryStorage();
    const store = new LocalTrainingSessionStore({
      storage,
      clock: createFixedClock(),
    });
    const state = createActiveSession([home], { sessionId: "version-session" });

    expect(store.save(state).ok).toBe(true);
    expect(storage.snapshot()[TRAINING_SESSION_STORAGE_KEY]).toBeTruthy();

    const loaded = store.load({ contentVersion: "9.9.9" });
    expect(loaded).toEqual({ status: "incompatible", reason: "content-version" });
    expect(storage.snapshot()[TRAINING_SESSION_STORAGE_KEY]).toBeUndefined();
  });

  it("recovers from corrupt storage without throwing", () => {
    const storage = createMemoryStorage({
      [TRAINING_SESSION_STORAGE_KEY]: "{not-json",
    });
    const store = new LocalTrainingSessionStore({
      storage,
      clock: createFixedClock(),
    });

    expect(store.load({ contentVersion: "1.0.0" })).toEqual({
      status: "corrupt",
      reason: "invalid-json",
    });
    expect(storage.snapshot()[TRAINING_SESSION_STORAGE_KEY]).toBeUndefined();
  });

  it("rejects structurally invalid persisted payload", () => {
    const storage = createMemoryStorage({
      [TRAINING_SESSION_STORAGE_KEY]: JSON.stringify({
        storageVersion: TRAINING_SESSION_STORAGE_VERSION,
        savedAt: "2026-08-08T12:00:00.000Z",
        expiresAt: "2026-08-15T12:00:00.000Z",
        sessionState: { broken: true },
      }),
    });
    const store = new LocalTrainingSessionStore({
      storage,
      clock: createFixedClock(),
    });

    expect(store.load()).toEqual({
      status: "corrupt",
      reason: "schema-validation-failed",
    });
  });

  it("does not invent a second completion when completed state is saved", () => {
    const [home] = createExercisePair();
    let state = createActiveSession([home], { seed: 1 });
    state = submitTrainingAnswer(state, {
      exercise: home,
      submission: {
        exerciseId: home.id,
        type: home.type,
        optionId: home.correctOptionId,
      },
      submissionId: "done-1",
      occurredAt: "2026-08-08T12:01:00.000Z",
    });
    state = trainingSessionReducer(state, {
      type: "next",
      occurredAt: "2026-08-08T12:02:00.000Z",
    });

    expect(state.status).toBe("completed");
    expect(() =>
      trainingSessionReducer(state, {
        type: "next",
        occurredAt: "2026-08-08T12:03:00.000Z",
      }),
    ).toThrow(/Cannot transition a session in status "completed"/);
  });
});
