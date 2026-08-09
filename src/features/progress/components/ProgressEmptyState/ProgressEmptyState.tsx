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
      description="Прогресс появится после завершения хотя бы одной облачной тренировки. Незавершённые сессии и локальный guest-прогресс сюда не попадают."
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
      description="Облачный прогресс доступен после входа. Guest-сессии остаются только на этом устройстве и не считаются долгосрочным прогрессом."
      title="Войдите, чтобы видеть прогресс"
    />
  );
}
