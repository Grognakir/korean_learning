import type { TrainingSessionState } from "../domain";
import { TRAINING_SESSION_SCHEMA_VERSION } from "../domain";

import { persistedTrainingSessionRecordSchema } from "./sessionStorageSchema";
import {
  TRAINING_SESSION_STORAGE_KEY,
  TRAINING_SESSION_STORAGE_VERSION,
  TRAINING_SESSION_TTL_MS,
  type PersistedTrainingSessionRecord,
  type TrainingSessionClock,
  type TrainingSessionLoadResult,
  type TrainingSessionStorageAdapter,
} from "./types";

export type LocalTrainingSessionStoreOptions = {
  readonly storage?: TrainingSessionStorageAdapter | null;
  readonly clock?: TrainingSessionClock;
  readonly key?: string;
  readonly ttlMs?: number;
};

function createBrowserStorage(): TrainingSessionStorageAdapter | null {
  if (typeof window === "undefined" || !window.localStorage) {
    return null;
  }

  return window.localStorage;
}

function defaultClock(): TrainingSessionClock {
  return {
    now: () => new Date(),
  };
}

export class LocalTrainingSessionStore {
  private readonly storage: TrainingSessionStorageAdapter | null;
  private readonly clock: TrainingSessionClock;
  private readonly key: string;
  private readonly ttlMs: number;

  constructor(options: LocalTrainingSessionStoreOptions = {}) {
    this.storage = options.storage === undefined ? createBrowserStorage() : options.storage;
    this.clock = options.clock ?? defaultClock();
    this.key = options.key ?? TRAINING_SESSION_STORAGE_KEY;
    this.ttlMs = options.ttlMs ?? TRAINING_SESSION_TTL_MS;
  }

  load(expected?: { readonly contentVersion?: string }): TrainingSessionLoadResult {
    if (!this.storage) {
      return { status: "missing" };
    }

    let raw: string | null;

    try {
      raw = this.storage.getItem(this.key);
    } catch {
      return { status: "corrupt", reason: "storage-read-failed" };
    }

    if (raw === null) {
      return { status: "missing" };
    }

    let parsed: unknown;

    try {
      parsed = JSON.parse(raw);
    } catch {
      this.clearQuietly();
      return { status: "corrupt", reason: "invalid-json" };
    }

    if (
      typeof parsed === "object" &&
      parsed !== null &&
      "storageVersion" in parsed &&
      (parsed as { storageVersion?: unknown }).storageVersion !== TRAINING_SESSION_STORAGE_VERSION
    ) {
      this.clearQuietly();
      return { status: "incompatible", reason: "storage-version" };
    }

    const validated = persistedTrainingSessionRecordSchema.safeParse(parsed);
    if (!validated.success) {
      this.clearQuietly();
      return { status: "corrupt", reason: "schema-validation-failed" };
    }

    const record = validated.data as PersistedTrainingSessionRecord;

    if (record.sessionState.schemaVersion !== TRAINING_SESSION_SCHEMA_VERSION) {
      this.clearQuietly();
      return { status: "incompatible", reason: "schema-version" };
    }

    if (
      expected?.contentVersion !== undefined &&
      record.sessionState.contentSnapshot.contentVersion !== expected.contentVersion
    ) {
      this.clearQuietly();
      return { status: "incompatible", reason: "content-version" };
    }

    const now = this.clock.now();
    const expiresAt = new Date(record.expiresAt);

    if (Number.isNaN(expiresAt.getTime()) || now.getTime() >= expiresAt.getTime()) {
      this.clearQuietly();
      return { status: "expired", reason: "ttl" };
    }

    return { status: "ok", record };
  }

  save(
    sessionState: TrainingSessionState,
  ): { readonly ok: true } | { readonly ok: false; readonly reason: string } {
    if (!this.storage) {
      return { ok: false, reason: "storage-unavailable" };
    }

    const savedAtDate = this.clock.now();
    const record: PersistedTrainingSessionRecord = {
      storageVersion: TRAINING_SESSION_STORAGE_VERSION,
      savedAt: savedAtDate.toISOString(),
      expiresAt: new Date(savedAtDate.getTime() + this.ttlMs).toISOString(),
      sessionState,
    };

    const validated = persistedTrainingSessionRecordSchema.safeParse(record);
    if (!validated.success) {
      return { ok: false, reason: "schema-validation-failed" };
    }

    try {
      this.storage.setItem(this.key, JSON.stringify(validated.data));
      return { ok: true };
    } catch {
      return { ok: false, reason: "storage-write-failed" };
    }
  }

  clear(): void {
    this.clearQuietly();
  }

  private clearQuietly(): void {
    if (!this.storage) {
      return;
    }

    try {
      this.storage.removeItem(this.key);
    } catch {
      // Ignore quota/security errors on cleanup paths.
    }
  }
}
