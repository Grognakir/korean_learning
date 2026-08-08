import type { MatchingExercise } from "../../exercise";
import { roundScoreRatio } from "../scoring";
import type { AnswerEvaluation, MatchingAnswerSubmission, MatchingItemResult } from "../types";

export function checkMatchingAnswer(
  exercise: MatchingExercise,
  submission: MatchingAnswerSubmission,
): AnswerEvaluation {
  const maxScore = exercise.scoring.points;
  const authoredPairIds = exercise.pairs.map((pair) => pair.id);
  const normalizedMatches = submission.matches.map((item) => ({
    leftPairId: item.leftPairId,
    rightPairId: item.rightPairId,
  }));

  const normalizedSubmission: MatchingAnswerSubmission = {
    exerciseId: submission.exerciseId,
    type: submission.type,
    matches: normalizedMatches,
  };

  const correctAnswer = {
    kind: "matching" as const,
    matches: exercise.pairs.map((pair) => ({
      leftPairId: pair.id,
      rightPairId: pair.id,
    })),
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
      itemResults: [],
    };
  }

  if (normalizedMatches.length !== authoredPairIds.length) {
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
      itemResults: [],
    };
  }

  const leftIds = normalizedMatches.map((item) => item.leftPairId);
  const rightIds = normalizedMatches.map((item) => item.rightPairId);

  if (new Set(leftIds).size !== leftIds.length || new Set(rightIds).size !== rightIds.length) {
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
      itemResults: [],
    };
  }

  for (const id of [...leftIds, ...rightIds]) {
    if (!authoredPairIds.includes(id)) {
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
        itemResults: [],
      };
    }
  }

  for (const authoredId of authoredPairIds) {
    if (!leftIds.includes(authoredId) || !rightIds.includes(authoredId)) {
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
        itemResults: [],
      };
    }
  }

  const itemResults: MatchingItemResult[] = normalizedMatches.map((item) => ({
    leftPairId: item.leftPairId,
    rightPairId: item.rightPairId,
    isCorrect: item.leftPairId === item.rightPairId,
    correctRightPairId: item.leftPairId,
  }));

  const correctCount = itemResults.filter((item) => item.isCorrect).length;
  const totalCount = itemResults.length;
  const allCorrect = correctCount === totalCount;
  const noneCorrect = correctCount === 0;

  let score = 0;
  let reasonCode: AnswerEvaluation["reasonCode"] = "incorrect";

  if (allCorrect) {
    score = maxScore;
    reasonCode = "correct";
  } else if (!noneCorrect && exercise.scoring.partialCredit) {
    score = Number(((maxScore * correctCount) / totalCount).toFixed(6));
    reasonCode = "partially-correct";
  } else {
    score = 0;
    reasonCode = "incorrect";
  }

  return {
    exerciseId: exercise.id,
    type: exercise.type,
    isCorrect: allCorrect,
    score,
    maxScore,
    scoreRatio: roundScoreRatio(score, maxScore),
    reasonCode,
    submission: normalizedSubmission,
    correctAnswer,
    explanation: exercise.explanation,
    itemResults,
  };
}
