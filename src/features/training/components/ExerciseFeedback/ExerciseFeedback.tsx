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
  const answerLines: string[] = [];

  if (evaluation.type === "fill-blank") {
    for (const item of evaluation.itemResults) {
      if (!item.isCorrect) {
        answerLines.push(
          `Правильный ответ: «${item.canonicalAnswer}»${
            item.submittedAnswer ? ` (вы написали «${item.submittedAnswer}»)` : ""
          }`,
        );
      }
    }
  }

  if (evaluation.type === "matching-translation" || evaluation.type === "matching-honorific") {
    for (const item of evaluation.itemResults) {
      if (!item.isCorrect) {
        answerLines.push(`Пара «${item.leftPairId}» сопоставлена неверно`);
      }
    }
  }

  const hasAnswerLines = answerLines.length > 0;
  const showExplanation = !hasAnswerLines && Boolean(explanation.ko || explanation.ru);

  return (
    <Alert
      className={styles.feedback}
      title={correctnessTitle(evaluation.reasonCode)}
      tone={toneForReason(evaluation.reasonCode)}
    >
      {showExplanation ? (
        <div className={styles.explanation}>
          <ExerciseText as="p" text={explanation} />
        </div>
      ) : null}
      {hasAnswerLines ? (
        <ul className={styles.errors}>
          {answerLines.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      ) : null}
    </Alert>
  );
}
