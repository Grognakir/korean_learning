"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/Button";
import { Select, type SelectOption } from "@/components/ui/Select";

import { startReviewSession } from "../../client/reviewApiClient";
import type { LearningSkill } from "../../domain/conceptKey";
import { filterReviewQueueItems } from "../../domain/filterReviewItems";
import type { ReviewQueueSummary as ReviewQueueSummaryData } from "../../domain";

import styles from "./ReviewQueueSummary.module.css";

const SKILL_OPTIONS: readonly SelectOption[] = [
  { value: "", label: "Все навыки" },
  { value: "grammar", label: "Грамматика" },
  { value: "vocabulary", label: "Словарь" },
  { value: "reading", label: "Чтение" },
];

export type ReviewUnitOption = {
  readonly moduleId: string;
  readonly unitSlug: string;
  readonly label: string;
};

export type ReviewQueueSummaryProps = {
  readonly summary: ReviewQueueSummaryData;
  readonly unitOptions?: readonly ReviewUnitOption[];
};

export function ReviewQueueSummary({ summary, unitOptions = [] }: ReviewQueueSummaryProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [skill, setSkill] = useState<LearningSkill | "">("");
  const [unitSlug, setUnitSlug] = useState("");

  const selectedModuleId =
    unitOptions.find((option) => option.unitSlug === unitSlug)?.moduleId ?? null;

  const filteredDueCount = useMemo(
    () =>
      filterReviewQueueItems(summary.dueItems, {
        skill: skill || null,
        moduleId: selectedModuleId,
      }).length,
    [summary.dueItems, skill, selectedModuleId],
  );

  const unitSelectOptions: readonly SelectOption[] = [
    { value: "", label: "Все темы" },
    ...unitOptions.map((option) => ({
      value: option.unitSlug,
      label: option.label,
    })),
  ];

  function handleStart() {
    setError(null);
    startTransition(async () => {
      try {
        const session = await startReviewSession({
          skill: skill || null,
          unitSlug: unitSlug || null,
        });
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

      <div className={styles.filters}>
        <label className={styles.field}>
          <span className={styles.label}>Навык</span>
          <Select
            aria-label="Навык для повторения"
            options={SKILL_OPTIONS}
            value={skill}
            onChange={(value) => setSkill(value as LearningSkill | "")}
          />
        </label>
        <label className={styles.field}>
          <span className={styles.label}>Тема</span>
          <Select
            aria-label="Тема для повторения"
            options={unitSelectOptions}
            value={unitSlug}
            onChange={setUnitSlug}
          />
        </label>
      </div>

      {skill || unitSlug ? (
        <p className={styles.filterHint}>По выбранным фильтрам готово: {filteredDueCount}</p>
      ) : null}

      <div className={styles.actions}>
        <Button disabled={pending || filteredDueCount === 0} onClick={handleStart} type="button">
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
