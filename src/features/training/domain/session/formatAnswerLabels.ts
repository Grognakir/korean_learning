import type { CorrectAnswerSnapshot, AnswerSubmission } from "../evaluation";
import type { Exercise, ExerciseText } from "../exercise";

function formatExerciseText(text: ExerciseText): string {
  if (text.ko && text.ru) {
    return `${text.ko} / ${text.ru}`;
  }

  return text.ko ?? text.ru ?? "—";
}

function choiceLabel(exercise: Exercise, optionId: string): string {
  if (
    exercise.type !== "meaning-choice" &&
    exercise.type !== "honorific-choice" &&
    exercise.type !== "plain-choice"
  ) {
    return optionId;
  }

  const option = exercise.options.find((item) => item.id === optionId);
  return option ? formatExerciseText(option.label) : optionId;
}

function matchingLeftLabel(exercise: Exercise, leftPairId: string): string {
  if (exercise.type !== "matching-translation" && exercise.type !== "matching-honorific") {
    return leftPairId;
  }

  const pair = exercise.pairs.find((item) => item.id === leftPairId);
  return pair ? formatExerciseText(pair.left) : leftPairId;
}

function matchingRightLabel(exercise: Exercise, rightPairId: string): string {
  if (exercise.type !== "matching-translation" && exercise.type !== "matching-honorific") {
    return rightPairId;
  }

  const pair = exercise.pairs.find((item) => item.id === rightPairId);
  return pair ? formatExerciseText(pair.right) : rightPairId;
}

export function formatSubmittedAnswerLabel(
  exercise: Exercise,
  submission: AnswerSubmission,
): string {
  switch (submission.type) {
    case "free-response":
      return submission.answer.trim() || "—";
    case "meaning-choice":
    case "honorific-choice":
    case "plain-choice":
      return choiceLabel(exercise, submission.optionId);
    case "fill-blank":
      return (
        submission.answers
          .map((item) => item.answer.trim())
          .filter(Boolean)
          .join(" · ") || "—"
      );
    case "matching-translation":
    case "matching-honorific":
      return (
        submission.matches
          .map(
            (item) =>
              `${matchingLeftLabel(exercise, item.leftPairId)} → ${matchingRightLabel(exercise, item.rightPairId)}`,
          )
          .join("; ") || "—"
      );
  }
}

export function formatCanonicalAnswerLabel(
  exercise: Exercise,
  correctAnswer: CorrectAnswerSnapshot,
): string {
  switch (correctAnswer.kind) {
    case "free-response":
      return correctAnswer.answer;
    case "choice":
      return choiceLabel(exercise, correctAnswer.optionId);
    case "fill-blank":
      return correctAnswer.answers.map((item) => item.answer).join(" · ");
    case "matching":
      return correctAnswer.matches
        .map(
          (item) =>
            `${matchingLeftLabel(exercise, item.leftPairId)} → ${matchingRightLabel(exercise, item.rightPairId)}`,
        )
        .join("; ");
  }
}
