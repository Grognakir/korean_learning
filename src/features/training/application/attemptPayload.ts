import type { Json } from "@/types/database";

import type { AnswerSubmission } from "../domain";
import { normalizeAnswer } from "../domain/evaluation/normalizeAnswer";

export function serializeSubmissionForStorage(submission: AnswerSubmission): Json {
  return submission as unknown as Json;
}

export function serializeNormalizedAnswer(submission: AnswerSubmission): Json {
  switch (submission.type) {
    case "free-response":
      return {
        type: submission.type,
        answer: normalizeAnswer(submission.answer),
      };
    case "meaning-choice":
    case "honorific-choice":
    case "plain-choice":
    case "single-choice":
      return {
        type: submission.type,
        optionId: submission.optionId,
      };
    case "fill-blank":
      return {
        type: submission.type,
        answers: submission.answers.map((item) => ({
          blankId: item.blankId,
          answer: normalizeAnswer(item.answer),
        })),
      };
    case "matching-translation":
    case "matching-honorific":
      return {
        type: submission.type,
        matches: submission.matches.map((item) => ({
          leftPairId: item.leftPairId,
          rightPairId: item.rightPairId,
        })),
      };
  }
}
