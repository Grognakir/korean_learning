import type { CorrectAnswerSnapshot, AnswerSubmission } from "../evaluation";
import type { ExerciseText } from "../exercise";
import type { PublicExercise } from "../../presentation/PublicExercise";
import type {
  ChoiceOptionView,
  MatchingLeftItemView,
  MatchingRightOptionView,
} from "../../presentation/toExerciseView";

function formatExerciseText(text: ExerciseText): string {
  if (text.ko && text.ru) {
    return `${text.ko} / ${text.ru}`;
  }

  return text.ko ?? text.ru ?? "—";
}

function choiceLabel(exercise: PublicExercise, optionId: string): string {
  if (
    exercise.type !== "meaning-choice" &&
    exercise.type !== "honorific-choice" &&
    exercise.type !== "plain-choice"
  ) {
    return optionId;
  }

  const option = exercise.options.find((item: ChoiceOptionView) => item.id === optionId);
  return option ? formatExerciseText(option.label) : optionId;
}

function matchingLeftLabel(exercise: PublicExercise, leftPairId: string): string {
  if (exercise.type !== "matching-translation" && exercise.type !== "matching-honorific") {
    return leftPairId;
  }

  const pair = exercise.leftItems.find((item: MatchingLeftItemView) => item.pairId === leftPairId);
  return pair ? formatExerciseText(pair.label) : leftPairId;
}

function matchingRightLabel(exercise: PublicExercise, rightPairId: string): string {
  if (exercise.type !== "matching-translation" && exercise.type !== "matching-honorific") {
    return rightPairId;
  }

  const pair = exercise.rightOptions.find(
    (item: MatchingRightOptionView) => item.pairId === rightPairId,
  );
  return pair ? formatExerciseText(pair.label) : rightPairId;
}

export function formatSubmittedAnswerLabel(
  exercise: PublicExercise,
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
  exercise: PublicExercise,
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
