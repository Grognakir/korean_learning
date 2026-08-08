"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { Alert } from "@/components/feedback";
import { Button } from "@/components/ui";

import { LocalTrainingSessionStore } from "../../persistence";
import type { PersistedTrainingSessionRecord } from "../../persistence";

import styles from "./ResumeTrainingPrompt.module.css";

export type ResumeTrainingPromptProps = {
  readonly store?: LocalTrainingSessionStore;
};

type ResumeViewState =
  | { readonly status: "pending" }
  | { readonly status: "hidden" }
  | {
      readonly status: "active";
      readonly record: PersistedTrainingSessionRecord;
    }
  | { readonly status: "notice"; readonly message: string };

export function ResumeTrainingPrompt({ store }: ResumeTrainingPromptProps) {
  const storeRef = useRef(store ?? new LocalTrainingSessionStore());
  const [view, setView] = useState<ResumeViewState>({ status: "pending" });

  useEffect(() => {
    const sessionStore = storeRef.current;
    const loaded = sessionStore.load();

    if (loaded.status === "ok" && loaded.record.sessionState.status === "active") {
      setView({ status: "active", record: loaded.record });
      return;
    }

    if (loaded.status === "corrupt") {
      setView({
        status: "notice",
        message: "Сохранённая тренировка повреждена и была сброшена.",
      });
      return;
    }

    if (loaded.status === "expired") {
      setView({
        status: "notice",
        message: "Срок сохранённой тренировки истёк — начните заново.",
      });
      return;
    }

    if (loaded.status === "incompatible") {
      setView({
        status: "notice",
        message: "Сохранённая тренировка устарела и была сброшена.",
      });
      return;
    }

    setView({ status: "hidden" });
  }, []);

  if (view.status === "pending" || view.status === "hidden") {
    return null;
  }

  if (view.status === "notice") {
    return (
      <Alert className={styles.panel} title="Сохранение" tone="info">
        {view.message}
      </Alert>
    );
  }

  const { sessionState } = view.record;
  const progressLabel = `Задание ${sessionState.currentIndex + 1} из ${sessionState.queue.length}`;

  return (
    <section aria-label="Незавершённая тренировка" className={styles.panel}>
      <div className={styles.copy}>
        <h2 className={styles.title}>Продолжить тренировку?</h2>
        <p className={styles.description}>
          Найдена незавершённая сессия ({progressLabel}). Можно вернуться к текущему заданию или
          начать заново.
        </p>
      </div>
      <div className={styles.actions}>
        <Link className={styles.primaryAction} href={`/training/${sessionState.sessionId}`}>
          Продолжить
        </Link>
        <Button
          onClick={() => {
            storeRef.current.clear();
            setView({ status: "hidden" });
          }}
          type="button"
          variant="secondary"
        >
          Начать заново
        </Button>
      </div>
    </section>
  );
}
