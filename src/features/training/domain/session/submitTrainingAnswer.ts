import type { Exercise } from "../exercise";
import { evaluateAnswer } from "../evaluation";
import type { AnswerEvaluation, AnswerSubmission } from "../evaluation";
import { trainingSessionReducer } from "./trainingSessionReducer";
import type { TrainingSessionState } from "./types";

export function submitTrainingAnswer(
  state: TrainingSessionState,
  input: {
    readonly submission: AnswerSubmission;
    readonly evaluation: AnswerEvaluation;
    readonly submissionId: string;
    readonly occurredAt: string;
  },
): TrainingSessionState {
  return trainingSessionReducer(state, {
    type: "submit",
    submissionId: input.submissionId,
    submission: input.submission,
    evaluation: input.evaluation,
    occurredAt: input.occurredAt,
  });
}

/** Test/dev helper that evaluates locally before recording the attempt. */
export function submitTrainingAnswerForExercise(
  state: TrainingSessionState,
  input: {
    readonly exercise: Exercise;
    readonly submission: AnswerSubmission;
    readonly submissionId: string;
    readonly occurredAt: string;
  },
): TrainingSessionState {
  return submitTrainingAnswer(state, {
    submission: input.submission,
    evaluation: evaluateAnswer(input.exercise, input.submission),
    submissionId: input.submissionId,
    occurredAt: input.occurredAt,
  });
}
