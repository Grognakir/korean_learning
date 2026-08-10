"use client";

import Link from "next/link";

import { EmptyState } from "@/components/feedback";

import styles from "./ProgressEmptyState.module.css";

export function ProgressEmptyState() {
  return (
    <EmptyState
      action={
        <>
          <Link className={styles.primaryAction} href="/training">
            Начать тренировку
          </Link>
          <Link className={styles.secondaryAction} href="/topics">
            Открыть темы
          </Link>
        </>
      }
      description="Прогресс появится после завершения хотя бы одной сохранённой тренировки. Незавершённые занятия сюда не попадают."
      title="Пока нет сохранённого прогресса"
    />
  );
}

export function ProgressGuestEmptyState() {
  return (
    <EmptyState
      action={
        <>
          <Link className={styles.primaryAction} href="/login?next=/progress">
            Войти
          </Link>
          <Link className={styles.secondaryAction} href="/training">
            Тренироваться как гость
          </Link>
        </>
      }
      description="Прогресс сохраняется после входа. Тренировки без входа остаются только на этом устройстве."
      title="Войдите, чтобы видеть прогресс"
    />
  );
}
