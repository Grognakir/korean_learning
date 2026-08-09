"use client";

import { useEffect, useRef, useState } from "react";

import { Alert } from "@/components/feedback";
import { Button } from "@/components/ui";
import { useAuthUser } from "@/features/authentication";

import type { ImportGuestTrainingSessionRequest } from "../../api/schemas";
import { importGuestTrainingSession } from "../../client/trainingApiClient";
import { LocalTrainingSessionStore } from "../../persistence";
import type { PersistedTrainingSessionRecord } from "../../persistence";

import styles from "./GuestSessionImportPrompt.module.css";

export type GuestSessionImportPromptProps = {
  readonly moduleIdBySlug?: Readonly<Record<string, string>>;
  readonly store?: LocalTrainingSessionStore;
};

type ImportViewState =
  | { readonly status: "pending" }
  | { readonly status: "hidden" }
  | {
      readonly status: "active";
      readonly record: PersistedTrainingSessionRecord;
    }
  | { readonly status: "success"; readonly message: string }
  | { readonly status: "error"; readonly message: string };

export function GuestSessionImportPrompt({
  moduleIdBySlug = {},
  store,
}: GuestSessionImportPromptProps) {
  const user = useAuthUser();
  const storeRef = useRef(store ?? new LocalTrainingSessionStore());
  const [view, setView] = useState<ImportViewState>({ status: "pending" });
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    if (!user) {
      return;
    }

    const loaded = storeRef.current.load();
    if (loaded.status === "ok" && loaded.record.sessionState.status === "active") {
      setView({ status: "active", record: loaded.record });
      return;
    }

    setView({ status: "hidden" });
  }, [user]);

  if (!user || view.status === "pending" || view.status === "hidden") {
    return null;
  }

  if (view.status === "success") {
    return (
      <Alert className={styles.panel} title="Импорт" tone="success">
        {view.message}
      </Alert>
    );
  }

  if (view.status === "error") {
    return (
      <Alert className={styles.panel} title="Импорт" tone="danger">
        {view.message}
      </Alert>
    );
  }

  const { sessionState } = view.record;
  const moduleId = moduleIdBySlug[sessionState.moduleSlug];

  async function handleImport() {
    if (!moduleId) {
      setView({
        status: "error",
        message: "Не удалось сопоставить модуль guest-сессии с серверным каталогом.",
      });
      return;
    }

    setIsImporting(true);

    try {
      await importGuestTrainingSession({
        guestSessionId: sessionState.sessionId,
        moduleId,
        mode: sessionState.mode,
        contentVersion: sessionState.contentSnapshot.contentVersion,
        randomSeed: String(sessionState.seed),
        exerciseIds: [...sessionState.contentSnapshot.exerciseIds],
        startedAt: sessionState.startedAt,
        completedAt: sessionState.completedAt,
        attempts: sessionState.attempts.map((attempt) => ({
          exerciseId: attempt.exerciseId,
          idempotencyKey: attempt.submissionId,
          submission:
            attempt.submission as ImportGuestTrainingSessionRequest["attempts"][number]["submission"],
          submittedAt: attempt.submittedAt,
        })),
      });

      storeRef.current.clear();
      setView({
        status: "success",
        message: "Guest-сессия перенесена в аккаунт. Локальная копия удалена.",
      });
    } catch (error) {
      setView({
        status: "error",
        message:
          error instanceof Error
            ? error.message
            : "Не удалось импортировать guest-сессию. Повторите попытку.",
      });
    } finally {
      setIsImporting(false);
    }
  }

  return (
    <section aria-label="Импорт guest-сессии" className={styles.panel}>
      <div className={styles.copy}>
        <h2 className={styles.title}>Перенести локальную тренировку?</h2>
        <p className={styles.description}>
          После входа можно перенести текущую незавершённую guest-сессию в аккаунт. Без
          подтверждения она останется только на этом устройстве.
        </p>
      </div>
      <div className={styles.actions}>
        <Button disabled={isImporting} onClick={() => void handleImport()} type="button">
          Перенести в аккаунт
        </Button>
        <Button
          disabled={isImporting}
          onClick={() => setView({ status: "hidden" })}
          type="button"
          variant="secondary"
        >
          Оставить локально
        </Button>
      </div>
    </section>
  );
}
