import type { ChoiceExercise } from "../../exercise";
import type { AnswerEvaluation, ChoiceAnswerSubmission } from "../types";
import { roundScoreRatio } from "../scoring";

export function checkChoiceAnswer(
  exercise: ChoiceExercise,
  submission: ChoiceAnswerSubmission,
): AnswerEvaluation {
  const maxScore = exercise.scoring.points;
  const normalizedSubmission: ChoiceAnswerSubmission = {
    exerciseId: submission.exerciseId,
    type: submission.type,
    optionId: submission.optionId,
  };

  const correctAnswer = {
    kind: "choice" as const,
    optionId: exercise.correctOptionId,
  };

  if (submission.exerciseId !== exercise.id || submission.type !== exercise.type) {
    return {
      exerciseId: exercise.id,
      type: exercise.type,
      isCorrect: false,
      score: 0,
      maxScore,
      scoreRatio: 0,
      reasonCode: "invalid-submission",
      submission: normalizedSubmission,
      correctAnswer,
      explanation: exercise.explanation,
    };
  }

  const optionExists = exercise.options.some((option) => option.id === submission.optionId);
  if (!optionExists) {
    return {
      exerciseId: exercise.id,
      type: exercise.type,
      isCorrect: false,
      score: 0,
      maxScore,
      scoreRatio: 0,
      reasonCode: "unknown-reference",
      submission: normalizedSubmission,
      correctAnswer,
      explanation: exercise.explanation,
    };
  }

  const isCorrect = submission.optionId === exercise.correctOptionId;
  const score = isCorrect ? maxScore : 0;

  return {
    exerciseId: exercise.id,
    type: exercise.type,
    isCorrect,
    score,
    maxScore,
    scoreRatio: roundScoreRatio(score, maxScore),
    reasonCode: isCorrect ? "correct" : "incorrect",
    submission: normalizedSubmission,
    correctAnswer,
    explanation: exercise.explanation,
  };
}
