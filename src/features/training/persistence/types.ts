export const TRAINING_SESSION_STORAGE_KEY = "korean-learning:training-session:v1";
export const TRAINING_SESSION_STORAGE_VERSION = 1 as const;
export const TRAINING_SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export type TrainingSessionStorageVersion = typeof TRAINING_SESSION_STORAGE_VERSION;

export type TrainingSessionStorageAdapter = {
  readonly getItem: (key: string) => string | null;
  readonly setItem: (key: string, value: string) => void;
  readonly removeItem: (key: string) => void;
};

export type TrainingSessionClock = {
  readonly now: () => Date;
};

export type PersistedTrainingSessionRecord = {
  readonly storageVersion: TrainingSessionStorageVersion;
  readonly savedAt: string;
  readonly expiresAt: string;
  readonly sessionState: import("../domain").TrainingSessionState;
};

export type TrainingSessionLoadResult =
  | { readonly status: "missing" }
  | { readonly status: "ok"; readonly record: PersistedTrainingSessionRecord }
  | { readonly status: "corrupt"; readonly reason: string }
  | { readonly status: "expired"; readonly reason: "ttl" }
  | {
      readonly status: "incompatible";
      readonly reason: "storage-version" | "schema-version" | "content-version";
    };
