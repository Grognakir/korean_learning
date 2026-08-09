import type { PublicGrammarTopicSummary, PublicUnitSummary } from "@/features/catalog/domain/types";
import type { PublicCurriculumExercise } from "@/features/reading/domain/types";

import { parseTrainingSetupRequest, type TrainingSetupRequest } from "./trainingSetupSchema";
import type { TrainingSetupUrlState } from "./parseTrainingSetupQuery";

export type TrainingSetupAvailability = {
  readonly availableCount: number;
  readonly difficulties: readonly ("easy" | "medium" | "hard")[];
  readonly maxSessionSize: number;
  readonly request: TrainingSetupRequest | null;
  readonly canPreview: boolean;
  readonly blockedReason: string | null;
};

const SKILL_LABEL: Record<TrainingSetupUrlState["skill"] & string, string> = {
  grammar: "грамматике",
  vocabulary: "словарю",
  reading: "чтению",
};

export function resolveTrainingSetup(input: {
  readonly url: TrainingSetupUrlState;
  readonly units: readonly PublicUnitSummary[];
  readonly grammarTopics: readonly PublicGrammarTopicSummary[];
  readonly exercises: readonly PublicCurriculumExercise[];
}): TrainingSetupAvailability {
  const { url, units, grammarTopics, exercises } = input;

  if (!url.skill) {
    return {
      availableCount: 0,
      difficulties: [],
      maxSessionSize: 0,
      request: null,
      canPreview: false,
      blockedReason: "Выберите навык",
    };
  }

  if (!url.unitSlug || !units.some((unit) => unit.slug === url.unitSlug)) {
    return {
      availableCount: 0,
      difficulties: [],
      maxSessionSize: 0,
      request: null,
      canPreview: false,
      blockedReason: "Выберите тему",
    };
  }

  if (
    url.skill === "grammar" &&
    url.grammarTopicId &&
    !grammarTopics.some((topic) => topic.logicalId === url.grammarTopicId)
  ) {
    return {
      availableCount: 0,
      difficulties: [],
      maxSessionSize: 0,
      request: null,
      canPreview: false,
      blockedReason: "Конструкция недоступна или не опубликована",
    };
  }

  let filtered = exercises.filter((exercise) => exercise.skill === url.skill);
  if (url.skill === "grammar" && url.grammarTopicId) {
    filtered = filtered.filter((exercise) => exercise.grammarTopicLogicalId === url.grammarTopicId);
  }
  if (url.difficulty) {
    filtered = filtered.filter((exercise) => exercise.difficulty === url.difficulty);
  }

  const difficulties = [...new Set(filtered.map((exercise) => exercise.difficulty))] as Array<
    "easy" | "medium" | "hard"
  >;
  difficulties.sort();

  const availableCount = filtered.length;
  const maxSessionSize = availableCount;
  const preferredSize = url.sessionSize ?? Math.min(5, maxSessionSize);
  const sessionSize =
    maxSessionSize === 0 ? 0 : Math.min(Math.max(1, preferredSize), maxSessionSize);

  const request = parseTrainingSetupRequest({
    skill: url.skill,
    unitSlug: url.unitSlug,
    grammarTopicId: url.skill === "grammar" ? (url.grammarTopicId ?? null) : null,
    difficulty: url.difficulty,
    sessionSize: sessionSize || 1,
  });

  if (availableCount === 0) {
    return {
      availableCount: 0,
      difficulties,
      maxSessionSize: 0,
      request,
      canPreview: false,
      blockedReason: `Нет approved упражнений по ${SKILL_LABEL[url.skill]} для выбранных фильтров`,
    };
  }

  // Session creation stays in F2-I18; setup only proves a valid request DTO.
  return {
    availableCount,
    difficulties,
    maxSessionSize,
    request,
    canPreview: false,
    blockedReason: "Создание отфильтрованной сессии будет в следующей итерации",
  };
}
