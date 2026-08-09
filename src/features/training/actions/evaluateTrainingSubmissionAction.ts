"use server";

import type { AnswerEvaluation, AnswerSubmission } from "../domain";

import {
  TrainingEvaluationError,
  evaluateTrainingSubmission,
} from "../server/evaluateTrainingSubmission";

export type EvaluateTrainingSubmissionInput = {
  readonly exerciseId: string;
  readonly contentVersion: string;
  readonly submission: AnswerSubmission;
};

export async function evaluateTrainingSubmissionAction(
  input: EvaluateTrainingSubmissionInput,
): Promise<AnswerEvaluation> {
  try {
    return await evaluateTrainingSubmission(input);
  } catch (error) {
    if (error instanceof TrainingEvaluationError) {
      throw error;
    }

    throw new TrainingEvaluationError("EVALUATION_FAILED", "Answer evaluation failed.");
  }
}
