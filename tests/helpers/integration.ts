import type { TrainingSessionClock, TrainingSessionStorageAdapter } from "@/features/training";

export function createMemoryStorage(
  initial: Record<string, string> = {},
): TrainingSessionStorageAdapter & { readonly snapshot: () => Record<string, string> } {
  const data = new Map(Object.entries(initial));

  return {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => {
      data.set(key, value);
    },
    removeItem: (key) => {
      data.delete(key);
    },
    snapshot: () => Object.fromEntries(data.entries()),
  };
}

export function createFixedClock(iso = "2026-08-08T12:00:00.000Z"): TrainingSessionClock {
  return {
    now: () => new Date(iso),
  };
}

export function createSubmissionIdFactory(prefix = "submission") {
  let counter = 0;
  return () => {
    counter += 1;
    return `${prefix}-${counter}`;
  };
}
