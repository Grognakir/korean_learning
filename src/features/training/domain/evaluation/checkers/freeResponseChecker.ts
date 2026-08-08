import type { FreeResponseExercise } from "../../exercise";
import { normalizeAnswer } from "../normalizeAnswer";
import { findCanonicalAcceptedAnswer, matchesAcceptedAnswer, roundScoreRatio } from "../scoring";
import type { AnswerEvaluation, FreeResponseAnswerSubmission } from "../types";

export function checkFreeResponseAnswer(
  exercise: FreeResponseExercise,
  submission: FreeResponseAnswerSubmission,
): AnswerEvaluation {
  const maxScore = exercise.scoring.points;
  const normalizedAnswer = normalizeAnswer(submission.answer);
  const normalizedSubmission: FreeResponseAnswerSubmission = {
    exerciseId: submission.exerciseId,
    type: submission.type,
    answer: normalizedAnswer,
  };

  const correctAnswer = {
    kind: "free-response" as const,
    answer: findCanonicalAcceptedAnswer(exercise.acceptedAnswers).value,
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

  if (normalizedAnswer.length === 0) {
    return {
      exerciseId: exercise.id,
      type: exercise.type,
      isCorrect: false,
      score: 0,
      maxScore,
      scoreRatio: 0,
      reasonCode: "empty-answer",
      submission: normalizedSubmission,
      correctAnswer,
      explanation: exercise.explanation,
    };
  }

  const isCorrect = matchesAcceptedAnswer(normalizedAnswer, exercise.acceptedAnswers);
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
