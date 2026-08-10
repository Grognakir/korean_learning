import Link from "next/link";

import { EmptyState } from "@/components/feedback/EmptyState";

import styles from "./ReviewEmptyState.module.css";

export function ReviewEmptyState() {
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
      description="Очередь появится после ошибочных ответов в сохранённой тренировке. Правильные ответы сюда не попадают."
      title="Пока нечего повторять"
    />
  );
}

export function ReviewGuestEmptyState() {
  return (
    <EmptyState
      action={
        <>
          <Link className={styles.primaryAction} href="/login?next=/review">
            Войти
          </Link>
          <Link className={styles.secondaryAction} href="/training">
            Тренироваться как гость
          </Link>
        </>
      }
      description="Персональная очередь доступна после входа. Тренировки без входа остаются только на этом устройстве."
      title="Войдите, чтобы видеть повторение"
    />
  );
}
