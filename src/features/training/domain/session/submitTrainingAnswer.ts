import type { Exercise } from "../exercise";
import { evaluateAnswer } from "../evaluation";
import type { AnswerSubmission } from "../evaluation";
import { trainingSessionReducer } from "./trainingSessionReducer";
import type { TrainingSessionState } from "./types";

export function submitTrainingAnswer(
  state: TrainingSessionState,
  input: {
    readonly exercise: Exercise;
    readonly submission: AnswerSubmission;
    readonly submissionId: string;
    readonly occurredAt: string;
  },
): TrainingSessionState {
  const evaluation = evaluateAnswer(input.exercise, input.submission);

  return trainingSessionReducer(state, {
    type: "submit",
    submissionId: input.submissionId,
    submission: input.submission,
    evaluation,
    occurredAt: input.occurredAt,
  });
}
