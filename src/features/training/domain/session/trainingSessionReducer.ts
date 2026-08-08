import { TrainingSessionError } from "./errors";
import type { TrainingSessionAction, TrainingSessionState } from "./types";

function assertActive(state: TrainingSessionState): void {
  if (state.status !== "active") {
    throw new TrainingSessionError(
      "session-not-active",
      `Cannot transition a session in status "${state.status}".`,
    );
  }
}

function hasAnsweredCurrent(state: TrainingSessionState): boolean {
  return state.attempts.length === state.currentIndex + 1;
}

export function trainingSessionReducer(
  state: TrainingSessionState,
  action: TrainingSessionAction,
): TrainingSessionState {
  switch (action.type) {
    case "submit": {
      assertActive(state);

      const existing = state.attempts.find(
        (attempt) => attempt.submissionId === action.submissionId,
      );
      if (existing) {
        return state;
      }

      if (hasAnsweredCurrent(state)) {
        throw new TrainingSessionError(
          "already-answered",
          "Current exercise already has an attempt; call next before submitting again.",
        );
      }

      const currentExerciseId = state.queue[state.currentIndex];
      if (!currentExerciseId) {
        throw new TrainingSessionError(
          "session-not-active",
          "Current exercise is missing from the session queue.",
        );
      }

      if (
        action.submission.exerciseId !== currentExerciseId ||
        action.evaluation.exerciseId !== currentExerciseId
      ) {
        throw new TrainingSessionError(
          "exercise-not-current",
          "Submission must target the current exercise in the session queue.",
        );
      }

      if (
        action.evaluation.submission.exerciseId !== action.submission.exerciseId ||
        action.evaluation.type !== action.submission.type
      ) {
        throw new TrainingSessionError(
          "invalid-evaluation",
          "Evaluation snapshot does not match the submission.",
        );
      }

      return {
        ...state,
        lastActivityAt: action.occurredAt,
        attempts: [
          ...state.attempts,
          {
            submissionId: action.submissionId,
            exerciseId: currentExerciseId,
            submittedAt: action.occurredAt,
            submission: action.submission,
            evaluation: action.evaluation,
          },
        ],
      };
    }
    case "next": {
      assertActive(state);

      if (!hasAnsweredCurrent(state)) {
        throw new TrainingSessionError(
          "answer-required-before-next",
          "Submit the current exercise before advancing.",
        );
      }

      const isLast = state.currentIndex >= state.queue.length - 1;
      if (isLast) {
        return {
          ...state,
          status: "completed",
          lastActivityAt: action.occurredAt,
          completedAt: action.occurredAt,
        };
      }

      return {
        ...state,
        currentIndex: state.currentIndex + 1,
        lastActivityAt: action.occurredAt,
      };
    }
    case "abandon": {
      assertActive(state);

      return {
        ...state,
        status: "abandoned",
        lastActivityAt: action.occurredAt,
        completedAt: null,
      };
    }
    default: {
      const exhaustiveCheck: never = action;
      throw new TrainingSessionError(
        "session-not-active",
        `Unsupported session action: ${JSON.stringify(exhaustiveCheck)}`,
      );
    }
  }
}
