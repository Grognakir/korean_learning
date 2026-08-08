import Link from "next/link";

import { Button } from "@/components/ui";

import styles from "./ResultActions.module.css";

export type ResultActionsProps = {
  readonly canRetryMistakes: boolean;
  readonly onRetryMistakes?: () => void;
};

export function ResultActions({ canRetryMistakes, onRetryMistakes }: ResultActionsProps) {
  return (
    <div className={styles.actions}>
      {canRetryMistakes && onRetryMistakes ? (
        <Button onClick={onRetryMistakes} type="button">
          Повторить ошибки
        </Button>
      ) : null}
      <Link className={styles.secondaryAction} href="/training">
        Новая тренировка
      </Link>
    </div>
  );
}
