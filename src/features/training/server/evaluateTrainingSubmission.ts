import "server-only";

import type { AnswerEvaluation, AnswerSubmission } from "../domain";
import { evaluateAnswer } from "../domain";

import { loadExerciseForEvaluation } from "../data/SupabaseExerciseRepository";
import { resolveContentSource } from "@/modules/contentSource";
import { getLocalLearningContent } from "@/modules/resolveLearningContent";

export class TrainingEvaluationError extends Error {
  readonly code:
    "EXERCISE_NOT_FOUND" | "VERSION_MISMATCH" | "EVALUATION_FAILED" | "INVALID_SUBMISSION";

  constructor(code: TrainingEvaluationError["code"], message: string) {
    super(message);
    this.name = "TrainingEvaluationError";
    this.code = code;
  }
}

async function loadExerciseForEvaluationBoundary(exerciseId: string, contentVersion: string) {
  if (resolveContentSource() === "local") {
    const sample = await getLocalLearningContent().exerciseRepository.getById(exerciseId);
    if (sample && sample.contentVersion === contentVersion) {
      return sample;
    }

    const { getFixtureDomainExerciseById } =
      await import("@/modules/curriculum/mapFixtureExerciseToDomain");
    const curriculum = getFixtureDomainExerciseById(exerciseId);
    if (curriculum && curriculum.contentVersion === contentVersion) {
      return curriculum;
    }

    return undefined;
  }

  return loadExerciseForEvaluation(exerciseId, contentVersion);
}

export async function evaluateTrainingSubmission(input: {
  readonly exerciseId: string;
  readonly contentVersion: string;
  readonly submission: AnswerSubmission;
}): Promise<AnswerEvaluation> {
  if (input.submission.exerciseId !== input.exerciseId) {
    throw new TrainingEvaluationError(
      "INVALID_SUBMISSION",
      "Submission exercise id does not match request.",
    );
  }

  const exercise = await loadExerciseForEvaluationBoundary(input.exerciseId, input.contentVersion);

  if (!exercise) {
    throw new TrainingEvaluationError(
      "EXERCISE_NOT_FOUND",
      "Exercise is unavailable for evaluation.",
    );
  }

  return evaluateAnswer(exercise, input.submission);
}
