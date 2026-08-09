import type { AnswerEvaluation, AnswerSubmission, Exercise } from "../domain";
import { evaluateAnswer } from "../domain";

export type EvaluateSubmissionInput = {
  readonly exerciseId: string;
  readonly contentVersion: string;
  readonly submission: AnswerSubmission;
};

export type EvaluateSubmissionFn = (input: EvaluateSubmissionInput) => Promise<AnswerEvaluation>;

export function createLocalEvaluateSubmission(
  exercises: readonly Exercise[],
): EvaluateSubmissionFn {
  const exercisesById = new Map(exercises.map((exercise) => [exercise.id, exercise]));

  return async ({ exerciseId, contentVersion, submission }) => {
    const exercise = exercisesById.get(exerciseId);

    if (!exercise || exercise.contentVersion !== contentVersion) {
      throw new Error(`Exercise ${exerciseId} is unavailable for local evaluation.`);
    }

    return evaluateAnswer(exercise, submission);
  };
}
