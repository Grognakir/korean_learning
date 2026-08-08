import type { AcceptedAnswer } from "../exercise";

import { normalizeAnswer } from "./normalizeAnswer";

export function findCanonicalAcceptedAnswer(
  acceptedAnswers: readonly AcceptedAnswer[],
): AcceptedAnswer {
  const canonical = acceptedAnswers.find((answer) => answer.isCanonical);
  if (!canonical) {
    throw new Error("Exercise is missing a canonical accepted answer.");
  }

  return canonical;
}

export function matchesAcceptedAnswer(
  submittedAnswer: string,
  acceptedAnswers: readonly AcceptedAnswer[],
): boolean {
  const normalizedSubmission = normalizeAnswer(submittedAnswer);
  if (normalizedSubmission.length === 0) {
    return false;
  }

  return acceptedAnswers.some(
    (accepted) => normalizeAnswer(accepted.value) === normalizedSubmission,
  );
}

export function roundScoreRatio(score: number, maxScore: number): number {
  if (maxScore === 0) {
    return 0;
  }

  return Number((score / maxScore).toFixed(6));
}
