import type { FillBlankExercise } from "../../exercise";
import { normalizeAnswer } from "../normalizeAnswer";
import { findCanonicalAcceptedAnswer, matchesAcceptedAnswer, roundScoreRatio } from "../scoring";
import type { AnswerEvaluation, FillBlankAnswerSubmission, FillBlankItemResult } from "../types";

export function checkFillBlankAnswer(
  exercise: FillBlankExercise,
  submission: FillBlankAnswerSubmission,
): AnswerEvaluation {
  const maxScore = exercise.scoring.points;
  const authoredBlankIds = exercise.blanks.map((blank) => blank.id);
  const normalizedAnswers = submission.answers.map((item) => ({
    blankId: item.blankId,
    answer: normalizeAnswer(item.answer),
  }));

  const normalizedSubmission: FillBlankAnswerSubmission = {
    exerciseId: submission.exerciseId,
    type: submission.type,
    answers: normalizedAnswers,
  };

  const correctAnswer = {
    kind: "fill-blank" as const,
    answers: exercise.blanks.map((blank) => ({
      blankId: blank.id,
      answer: findCanonicalAcceptedAnswer(blank.acceptedAnswers).value,
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

  const submittedBlankIds = normalizedAnswers.map((item) => item.blankId);
  const uniqueSubmittedIds = new Set(submittedBlankIds);

  if (
    submittedBlankIds.length !== authoredBlankIds.length ||
    uniqueSubmittedIds.size !== submittedBlankIds.length
  ) {
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

  for (const blankId of submittedBlankIds) {
    if (!authoredBlankIds.includes(blankId)) {
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

  if (normalizedAnswers.some((item) => item.answer.length === 0)) {
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
      itemResults: [],
    };
  }

  const answersByBlankId = new Map(normalizedAnswers.map((item) => [item.blankId, item.answer]));

  const itemResults: FillBlankItemResult[] = exercise.blanks.map((blank) => {
    const submittedAnswer = answersByBlankId.get(blank.id) ?? "";
    const canonicalAnswer = findCanonicalAcceptedAnswer(blank.acceptedAnswers).value;

    return {
      blankId: blank.id,
      isCorrect: matchesAcceptedAnswer(submittedAnswer, blank.acceptedAnswers),
      submittedAnswer,
      canonicalAnswer,
    };
  });

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
