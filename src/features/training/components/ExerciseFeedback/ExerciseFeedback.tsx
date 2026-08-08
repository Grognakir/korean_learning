import { Alert } from "@/components/feedback";

import type { TrainingAttemptSnapshot } from "../../domain";
import { ExerciseText } from "../ExerciseText";
import { toExerciseTextView } from "../../presentation";

import styles from "./ExerciseFeedback.module.css";

export type ExerciseFeedbackProps = {
  readonly attempt: TrainingAttemptSnapshot;
};

function correctnessTitle(reasonCode: TrainingAttemptSnapshot["evaluation"]["reasonCode"]): string {
  switch (reasonCode) {
    case "correct":
      return "Верно";
    case "partially-correct":
      return "Частично верно";
    case "incorrect":
    case "empty-answer":
    case "invalid-submission":
    case "unknown-reference":
      return "Неверно";
  }
}

function toneForReason(
  reasonCode: TrainingAttemptSnapshot["evaluation"]["reasonCode"],
): "success" | "warning" | "danger" {
  switch (reasonCode) {
    case "correct":
      return "success";
    case "partially-correct":
      return "warning";
    default:
      return "danger";
  }
}

export function ExerciseFeedback({ attempt }: ExerciseFeedbackProps) {
  const { evaluation } = attempt;
  const explanation = toExerciseTextView(evaluation.explanation);
  const itemErrors: string[] = [];

  if (evaluation.type === "fill-blank") {
    for (const item of evaluation.itemResults) {
      if (!item.isCorrect) {
        itemErrors.push(
          `Пропуск «${item.blankId}»: ожидалось «${item.canonicalAnswer}», получено «${item.submittedAnswer || "—"}».`,
        );
      }
    }
  }

  if (evaluation.type === "matching-translation" || evaluation.type === "matching-honorific") {
    for (const item of evaluation.itemResults) {
      if (!item.isCorrect) {
        itemErrors.push(`Пара «${item.leftPairId}» сопоставлена неверно.`);
      }
    }
  }

  return (
    <Alert
      className={styles.feedback}
      title={correctnessTitle(evaluation.reasonCode)}
      tone={toneForReason(evaluation.reasonCode)}
    >
      <p className={styles.status}>
        {evaluation.isCorrect
          ? "Ответ принят как правильный."
          : evaluation.reasonCode === "partially-correct"
            ? "Часть ответа верна — проверьте отмеченные элементы."
            : "Ответ пока неправильный. Изучите пояснение и продолжайте."}
      </p>
      {explanation.ko || explanation.ru ? (
        <div className={styles.explanation}>
          <strong>Пояснение</strong>
          <ExerciseText as="p" text={explanation} />
        </div>
      ) : null}
      {itemErrors.length > 0 ? (
        <ul className={styles.errors}>
          {itemErrors.map((error) => (
            <li key={error}>{error}</li>
          ))}
        </ul>
      ) : null}
    </Alert>
  );
}
