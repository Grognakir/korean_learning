"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/Button";

import { startReviewSession } from "../../client/reviewApiClient";
import type { ReviewQueueSummary as ReviewQueueSummaryData } from "../../domain";

import styles from "./ReviewQueueSummary.module.css";

export type ReviewQueueSummaryProps = {
  readonly summary: ReviewQueueSummaryData;
};

export function ReviewQueueSummary({ summary }: ReviewQueueSummaryProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleStart() {
    setError(null);
    startTransition(async () => {
      try {
        const session = await startReviewSession();
        router.push(`/training/${session.sessionId}`);
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Не удалось начать повторение.");
      }
    });
  }

  return (
    <section aria-label="Очередь повторения" className={styles.panel}>
      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.statValue}>{summary.dueCount}</span>
          <span className={styles.statLabel}>Готово к повторению</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>{summary.scheduledCount}</span>
          <span className={styles.statLabel}>Запланировано</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>{summary.masteredCount}</span>
          <span className={styles.statLabel}>Освоено</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>{summary.suspendedCount}</span>
          <span className={styles.statLabel}>Приостановлено</span>
        </div>
      </div>

      <div className={styles.actions}>
        <Button disabled={pending || summary.dueCount === 0} onClick={handleStart} type="button">
          {pending ? "Запускаем…" : "Начать повторение"}
        </Button>
      </div>

      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}
    </section>
  );
}
