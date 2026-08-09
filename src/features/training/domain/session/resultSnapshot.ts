import type { LearningTopicDefinition, LocalizedText } from "@/types";

import type { AnswerReasonCode } from "../evaluation";
import type { ExerciseText } from "../exercise";
import type { PublicExercise } from "../../presentation/PublicExercise";

import { formatCanonicalAnswerLabel, formatSubmittedAnswerLabel } from "./formatAnswerLabels";
import { selectMistakeExerciseIds, selectScoreSummary } from "./selectors";
import type { TrainingSessionState } from "./types";

const UNKNOWN_TOPIC_ID = "__unknown__";

const UNKNOWN_TOPIC_TITLE = {
  ko: "제목 없는 주제",
  ru: "Тема без названия",
} as const satisfies LocalizedText;

export type TrainingResultTopicBreakdown = {
  readonly topicId: string;
  readonly title: LocalizedText;
  readonly correctCount: number;
  readonly gradedCount: number;
  readonly score: number;
  readonly maxScore: number;
};

export type TrainingResultMistake = {
  readonly exerciseId: string;
  readonly prompt: ExerciseText;
  readonly userAnswerLabel: string;
  readonly canonicalAnswerLabel: string;
  readonly explanation: ExerciseText;
  readonly reasonCode: AnswerReasonCode;
};

export type TrainingResultSnapshot = {
  readonly sessionId: string;
  readonly moduleSlug: string;
  readonly completedAt: string | null;
  readonly correctCount: number;
  readonly totalCount: number;
  readonly score: number;
  readonly maxScore: number;
  readonly percentage: number;
  readonly topics: readonly TrainingResultTopicBreakdown[];
  readonly mistakes: readonly TrainingResultMistake[];
  readonly mistakeExerciseIds: readonly string[];
};

export type BuildTrainingResultSnapshotOptions = {
  readonly topics?: readonly LearningTopicDefinition[];
};

function resolveTopicId(exercise: PublicExercise | undefined): string {
  return exercise?.topicIds[0] ?? UNKNOWN_TOPIC_ID;
}

function buildTopicBreakdown(
  state: TrainingSessionState,
  exercisesById: ReadonlyMap<string, PublicExercise>,
  topicsById: ReadonlyMap<string, LearningTopicDefinition>,
): readonly TrainingResultTopicBreakdown[] {
  const buckets = new Map<
    string,
    {
      correctCount: number;
      gradedCount: number;
      score: number;
      maxScore: number;
    }
  >();

  for (const attempt of state.attempts) {
    const exercise = exercisesById.get(attempt.exerciseId);
    const topicId = resolveTopicId(exercise);
    const current = buckets.get(topicId) ?? {
      correctCount: 0,
      gradedCount: 0,
      score: 0,
      maxScore: 0,
    };

    buckets.set(topicId, {
      correctCount: current.correctCount + (attempt.evaluation.isCorrect ? 1 : 0),
      gradedCount: current.gradedCount + 1,
      score: current.score + attempt.evaluation.score,
      maxScore: current.maxScore + attempt.evaluation.maxScore,
    });
  }

  return [...buckets.entries()]
    .map(([topicId, stats]) => {
      const topic = topicsById.get(topicId);
      return {
        topicId,
        title: topic?.title ?? UNKNOWN_TOPIC_TITLE,
        ...stats,
      };
    })
    .sort((left, right) => {
      const leftOrder = topicsById.get(left.topicId)?.sortOrder ?? Number.MAX_SAFE_INTEGER;
      const rightOrder = topicsById.get(right.topicId)?.sortOrder ?? Number.MAX_SAFE_INTEGER;
      if (leftOrder !== rightOrder) {
        return leftOrder - rightOrder;
      }

      return left.topicId.localeCompare(right.topicId);
    });
}

function buildMistakes(
  state: TrainingSessionState,
  exercisesById: ReadonlyMap<string, PublicExercise>,
): readonly TrainingResultMistake[] {
  const mistakes: TrainingResultMistake[] = [];
  const seen = new Set<string>();

  for (const attempt of state.attempts) {
    if (attempt.evaluation.isCorrect || seen.has(attempt.exerciseId)) {
      continue;
    }

    seen.add(attempt.exerciseId);
    const exercise = exercisesById.get(attempt.exerciseId);
    if (!exercise) {
      mistakes.push({
        exerciseId: attempt.exerciseId,
        prompt: { ko: null, ru: "Задание недоступно" },
        userAnswerLabel: "—",
        canonicalAnswerLabel: "—",
        explanation: attempt.evaluation.explanation,
        reasonCode: attempt.evaluation.reasonCode,
      });
      continue;
    }

    mistakes.push({
      exerciseId: attempt.exerciseId,
      prompt: exercise.prompt,
      userAnswerLabel: formatSubmittedAnswerLabel(exercise, attempt.evaluation.submission),
      canonicalAnswerLabel: formatCanonicalAnswerLabel(exercise, attempt.evaluation.correctAnswer),
      explanation: attempt.evaluation.explanation,
      reasonCode: attempt.evaluation.reasonCode,
    });
  }

  return mistakes;
}

export function buildTrainingResultSnapshot(
  state: TrainingSessionState,
  exercisesById: ReadonlyMap<string, PublicExercise>,
  options: BuildTrainingResultSnapshotOptions = {},
): TrainingResultSnapshot {
  if (state.status !== "completed") {
    throw new Error("Training result snapshot requires a completed session.");
  }

  const scoreSummary = selectScoreSummary(state);
  const topicsById = new Map((options.topics ?? []).map((topic) => [topic.id, topic]));
  const percentage = scoreSummary.maxScore === 0 ? 0 : Math.round(scoreSummary.scoreRatio * 100);

  return {
    sessionId: state.sessionId,
    moduleSlug: state.moduleSlug,
    completedAt: state.completedAt,
    correctCount: scoreSummary.correctCount,
    totalCount: scoreSummary.gradedCount,
    score: scoreSummary.score,
    maxScore: scoreSummary.maxScore,
    percentage,
    topics: buildTopicBreakdown(state, exercisesById, topicsById),
    mistakes: buildMistakes(state, exercisesById),
    mistakeExerciseIds: selectMistakeExerciseIds(state),
  };
}

export function createMistakeRetrySessionConfig(input: {
  readonly sessionId: string;
  readonly moduleSlug: string;
  readonly mistakeExerciseIds: readonly string[];
  readonly contentVersion: string;
  readonly startedAt: string;
  readonly seed?: number;
}) {
  return {
    sessionId: input.sessionId,
    moduleSlug: input.moduleSlug,
    mode: "review" as const,
    seed: input.seed ?? 0,
    exerciseIds: input.mistakeExerciseIds,
    startedAt: input.startedAt,
    contentSnapshot: {
      contentVersion: input.contentVersion,
      exerciseIds: [...input.mistakeExerciseIds],
    },
  };
}
