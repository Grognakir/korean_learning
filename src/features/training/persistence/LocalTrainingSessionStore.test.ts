import { describe, expect, it, vi } from "vitest";

import { createTrainingSession, TRAINING_SESSION_SCHEMA_VERSION } from "../domain";
import { LocalTrainingSessionStore } from "./LocalTrainingSessionStore";
import {
  TRAINING_SESSION_STORAGE_KEY,
  TRAINING_SESSION_STORAGE_VERSION,
  type TrainingSessionStorageAdapter,
} from "./types";

function createMemoryStorage(initial?: Record<string, string>): TrainingSessionStorageAdapter {
  const data = new Map<string, string>(Object.entries(initial ?? {}));

  return {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => {
      data.set(key, value);
    },
    removeItem: (key) => {
      data.delete(key);
    },
  };
}

function createActiveSession() {
  return createTrainingSession({
    sessionId: "demo-session",
    moduleSlug: "sample-module",
    mode: "practice",
    seed: 17,
    exerciseIds: ["a1111111-1111-4111-8111-111111111111", "a2222222-2222-4222-8222-222222222222"],
    startedAt: "2026-08-01T00:00:00.000Z",
    contentSnapshot: {
      contentVersion: "1.0.0",
      exerciseIds: ["a1111111-1111-4111-8111-111111111111", "a2222222-2222-4222-8222-222222222222"],
    },
  });
}

describe("LocalTrainingSessionStore", () => {
  it("returns missing when the key is absent", () => {
    const store = new LocalTrainingSessionStore({
      storage: createMemoryStorage(),
      clock: { now: () => new Date("2026-08-08T00:00:00.000Z") },
    });

    expect(store.load()).toEqual({ status: "missing" });
  });

  it("roundtrips a valid session save and load", () => {
    const storage = createMemoryStorage();
    const store = new LocalTrainingSessionStore({
      storage,
      clock: { now: () => new Date("2026-08-08T00:00:00.000Z") },
    });
    const session = createActiveSession();

    expect(store.save(session)).toEqual({ ok: true });
    expect(store.load()).toEqual({
      status: "ok",
      record: {
        storageVersion: TRAINING_SESSION_STORAGE_VERSION,
        savedAt: "2026-08-08T00:00:00.000Z",
        expiresAt: "2026-08-15T00:00:00.000Z",
        sessionState: session,
      },
    });
    expect(storage.getItem(TRAINING_SESSION_STORAGE_KEY)).toContain('"demo-session"');
  });

  it("treats corrupt JSON as corrupt and clears the key", () => {
    const storage = createMemoryStorage({
      [TRAINING_SESSION_STORAGE_KEY]: "{not-json",
    });
    const store = new LocalTrainingSessionStore({ storage });

    expect(store.load()).toEqual({ status: "corrupt", reason: "invalid-json" });
    expect(storage.getItem(TRAINING_SESSION_STORAGE_KEY)).toBeNull();
  });

  it("treats structurally invalid payloads as corrupt and clears the key", () => {
    const storage = createMemoryStorage({
      [TRAINING_SESSION_STORAGE_KEY]: JSON.stringify({
        storageVersion: TRAINING_SESSION_STORAGE_VERSION,
        savedAt: "2026-08-08T00:00:00.000Z",
        expiresAt: "2026-08-15T00:00:00.000Z",
        sessionState: { broken: true },
      }),
    });
    const store = new LocalTrainingSessionStore({ storage });

    expect(store.load()).toEqual({ status: "corrupt", reason: "schema-validation-failed" });
    expect(storage.getItem(TRAINING_SESSION_STORAGE_KEY)).toBeNull();
  });

  it("expires at and after expiresAt, but keeps records before it", () => {
    const session = createActiveSession();
    const storage = createMemoryStorage();
    const clock = { now: vi.fn(() => new Date("2026-08-08T00:00:00.000Z")) };
    const store = new LocalTrainingSessionStore({ storage, clock });

    store.save(session);

    clock.now.mockReturnValue(new Date("2026-08-14T23:59:59.999Z"));
    expect(store.load().status).toBe("ok");

    clock.now.mockReturnValue(new Date("2026-08-15T00:00:00.000Z"));
    expect(store.load()).toEqual({ status: "expired", reason: "ttl" });
    expect(storage.getItem(TRAINING_SESSION_STORAGE_KEY)).toBeNull();
  });

  it("rejects storage version mismatches", () => {
    const storage = createMemoryStorage({
      [TRAINING_SESSION_STORAGE_KEY]: JSON.stringify({
        storageVersion: 999,
        savedAt: "2026-08-08T00:00:00.000Z",
        expiresAt: "2026-08-15T00:00:00.000Z",
        sessionState: createActiveSession(),
      }),
    });
    const store = new LocalTrainingSessionStore({
      storage,
      clock: { now: () => new Date("2026-08-08T00:00:00.000Z") },
    });

    expect(store.load()).toEqual({ status: "incompatible", reason: "storage-version" });
    expect(storage.getItem(TRAINING_SESSION_STORAGE_KEY)).toBeNull();
  });

  it("rejects content version mismatches when expected", () => {
    const storage = createMemoryStorage();
    const store = new LocalTrainingSessionStore({
      storage,
      clock: { now: () => new Date("2026-08-08T00:00:00.000Z") },
    });
    store.save(createActiveSession());

    expect(store.load({ contentVersion: "9.9.9" })).toEqual({
      status: "incompatible",
      reason: "content-version",
    });
    expect(storage.getItem(TRAINING_SESSION_STORAGE_KEY)).toBeNull();
  });

  it("clears explicitly and survives localStorage write failures", () => {
    const storage: TrainingSessionStorageAdapter = {
      getItem: () => null,
      setItem: () => {
        throw new Error("quota");
      },
      removeItem: vi.fn(),
    };
    const store = new LocalTrainingSessionStore({
      storage,
      clock: { now: () => new Date("2026-08-08T00:00:00.000Z") },
    });

    expect(store.save(createActiveSession())).toEqual({
      ok: false,
      reason: "storage-write-failed",
    });

    store.clear();
    expect(storage.removeItem).toHaveBeenCalledWith(TRAINING_SESSION_STORAGE_KEY);
  });

  it("does not throw when storage is unavailable (SSR)", () => {
    const store = new LocalTrainingSessionStore({
      storage: null,
      clock: { now: () => new Date("2026-08-08T00:00:00.000Z") },
    });

    expect(store.load()).toEqual({ status: "missing" });
    expect(store.save(createActiveSession())).toEqual({
      ok: false,
      reason: "storage-unavailable",
    });
  });

  it("keeps schema version aligned with the domain constant", () => {
    expect(createActiveSession().schemaVersion).toBe(TRAINING_SESSION_SCHEMA_VERSION);
  });
});
