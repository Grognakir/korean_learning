"use client";

import { useEffect, useRef, useState } from "react";

import type { TrainingSessionState } from "../domain";
import { LocalTrainingSessionStore } from "../persistence";
import {
  DEMO_TRAINING_MODULE_SLUG,
  DEMO_TRAINING_SESSION_ID,
  type UseTrainingSessionOptions,
} from "./useTrainingSession";

export type PersistedSessionBootstrap =
  | { readonly status: "pending" }
  | {
      readonly status: "ready";
      readonly initialState?: TrainingSessionState;
      readonly notice: string | null;
      readonly persistCreate: boolean;
    };

export type UsePersistedSessionBootstrapOptions = {
  readonly persist?: boolean;
  readonly sessionId?: string;
  readonly moduleSlug?: string;
  readonly contentVersion?: string;
  readonly store?: LocalTrainingSessionStore;
};

function noticeForLoadStatus(
  status: "corrupt" | "expired" | "incompatible" | "missing" | "ok",
): string | null {
  switch (status) {
    case "corrupt":
      return "Сохранённая тренировка повреждена и была сброшена.";
    case "expired":
      return "Срок сохранённой тренировки истёк — начните заново.";
    case "incompatible":
      return "Сохранённая тренировка устарела и была сброшена.";
    default:
      return null;
  }
}

/**
 * Reads local persistence after mount so SSR/hydration markup stays stable.
 * Callers should remount the live session hook when status becomes `ready`.
 */
export function usePersistedSessionBootstrap(
  options: UsePersistedSessionBootstrapOptions = {},
): PersistedSessionBootstrap {
  const persist = options.persist ?? true;
  const storeRef = useRef(options.store ?? new LocalTrainingSessionStore());
  const contentVersion = options.contentVersion ?? "1.0.0";
  const expectedSessionId = options.sessionId ?? DEMO_TRAINING_SESSION_ID;
  const expectedModuleSlug = options.moduleSlug ?? DEMO_TRAINING_MODULE_SLUG;

  const [bootstrap, setBootstrap] = useState<PersistedSessionBootstrap>(() =>
    persist ? { status: "pending" } : { status: "ready", notice: null, persistCreate: false },
  );

  useEffect(() => {
    if (!persist) {
      return;
    }

    const loaded = storeRef.current.load({ contentVersion });
    const notice = noticeForLoadStatus(loaded.status);

    if (loaded.status === "ok") {
      const saved = loaded.record.sessionState;
      const matchesRoute =
        saved.sessionId === expectedSessionId && saved.moduleSlug === expectedModuleSlug;

      setBootstrap({
        status: "ready",
        notice,
        persistCreate: !matchesRoute,
        ...(matchesRoute ? { initialState: saved } : {}),
      });
      return;
    }

    setBootstrap({
      status: "ready",
      notice,
      persistCreate: true,
    });
  }, [persist, contentVersion, expectedSessionId, expectedModuleSlug]);

  return bootstrap;
}

export function persistTrainingSessionState(
  state: TrainingSessionState,
  store: LocalTrainingSessionStore = new LocalTrainingSessionStore(),
): void {
  store.save(state);
}

export type { UseTrainingSessionOptions };
