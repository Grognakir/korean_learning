import type { Exercise } from "../exercise";
import type { TrainingAttemptSnapshot, TrainingSessionState } from "./types";

export type TrainingSessionProgress = {
  readonly current: number;
  readonly total: number;
  readonly answeredCount: number;
};

export type TrainingSessionScoreSummary = {
  readonly score: number;
  readonly maxScore: number;
  readonly scoreRatio: number;
  readonly correctCount: number;
  readonly gradedCount: number;
};

export type TrainingSessionResultSummary = TrainingSessionScoreSummary & {
  readonly status: TrainingSessionState["status"];
  readonly mistakeExerciseIds: readonly string[];
};

export function selectCurrentExerciseId(state: TrainingSessionState): string | null {
  if (state.status !== "active") {
    return null;
  }

  return state.queue[state.currentIndex] ?? null;
}

export function selectCurrentExercise(
  state: TrainingSessionState,
  exercisesById: ReadonlyMap<string, Exercise>,
): Exercise | null {
  const exerciseId = selectCurrentExerciseId(state);
  if (!exerciseId) {
    return null;
  }

  return exercisesById.get(exerciseId) ?? null;
}

export function selectHasAnsweredCurrent(state: TrainingSessionState): boolean {
  return state.attempts.length === state.currentIndex + 1;
}

export function selectCurrentAttempt(state: TrainingSessionState): TrainingAttemptSnapshot | null {
  if (!selectHasAnsweredCurrent(state)) {
    return null;
  }

  return state.attempts[state.currentIndex] ?? null;
}

export function selectProgress(state: TrainingSessionState): TrainingSessionProgress {
  return {
    current: Math.min(state.currentIndex + 1, state.queue.length),
    total: state.queue.length,
    answeredCount: state.attempts.length,
  };
}

export function selectScoreSummary(state: TrainingSessionState): TrainingSessionScoreSummary {
  const score = state.attempts.reduce((total, attempt) => total + attempt.evaluation.score, 0);
  const maxScore = state.attempts.reduce(
    (total, attempt) => total + attempt.evaluation.maxScore,
    0,
  );
  const correctCount = state.attempts.filter((attempt) => attempt.evaluation.isCorrect).length;

  return {
    score,
    maxScore,
    scoreRatio: maxScore === 0 ? 0 : Number((score / maxScore).toFixed(6)),
    correctCount,
    gradedCount: state.attempts.length,
  };
}

export function selectMistakeExerciseIds(state: TrainingSessionState): readonly string[] {
  const mistakes: string[] = [];
  const seen = new Set<string>();

  for (const attempt of state.attempts) {
    if (attempt.evaluation.isCorrect) {
      continue;
    }

    if (seen.has(attempt.exerciseId)) {
      continue;
    }

    seen.add(attempt.exerciseId);
    mistakes.push(attempt.exerciseId);
  }

  return mistakes;
}

export function selectResultSummary(state: TrainingSessionState): TrainingSessionResultSummary {
  return {
    status: state.status,
    mistakeExerciseIds: selectMistakeExerciseIds(state),
    ...selectScoreSummary(state),
  };
}
