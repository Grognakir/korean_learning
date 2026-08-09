import type { LearningSkillId } from "@/features/catalog/domain/types";

import { learningSkillSchema } from "./trainingSetupSchema";

export type TrainingSetupUrlState = {
  readonly skill: LearningSkillId | null;
  readonly unitSlug: string | null;
  readonly grammarTopicId: string | null;
  readonly difficulty: "easy" | "medium" | "hard" | null;
  readonly sessionSize: number | null;
};

function firstString(value: string | string[] | undefined): string | null {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) {
    return null;
  }
  const trimmed = raw.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function parseTrainingSetupQuery(params: {
  skill?: string | string[];
  unit?: string | string[];
  grammar?: string | string[];
  difficulty?: string | string[];
  size?: string | string[];
}): TrainingSetupUrlState {
  const skillRaw = firstString(params.skill);
  const skillParsed = skillRaw ? learningSkillSchema.safeParse(skillRaw) : null;
  const difficultyRaw = firstString(params.difficulty);
  const difficulty =
    difficultyRaw === "easy" || difficultyRaw === "medium" || difficultyRaw === "hard"
      ? difficultyRaw
      : null;
  const sizeRaw = firstString(params.size);
  const sizeNumber = sizeRaw ? Number.parseInt(sizeRaw, 10) : NaN;

  return {
    skill: skillParsed?.success ? skillParsed.data : null,
    unitSlug: firstString(params.unit),
    grammarTopicId: firstString(params.grammar),
    difficulty,
    sessionSize: Number.isFinite(sizeNumber) && sizeNumber > 0 ? sizeNumber : null,
  };
}

export function buildTrainingSetupHref(state: {
  readonly skill?: LearningSkillId | null;
  readonly unitSlug?: string | null;
  readonly grammarTopicId?: string | null;
  readonly difficulty?: "easy" | "medium" | "hard" | null;
  readonly sessionSize?: number | null;
}): string {
  const params = new URLSearchParams();
  if (state.skill) {
    params.set("skill", state.skill);
  }
  if (state.unitSlug) {
    params.set("unit", state.unitSlug);
  }
  if (state.grammarTopicId) {
    params.set("grammar", state.grammarTopicId);
  }
  if (state.difficulty) {
    params.set("difficulty", state.difficulty);
  }
  if (state.sessionSize && state.sessionSize > 0) {
    params.set("size", String(state.sessionSize));
  }
  const query = params.toString();
  return query ? `/training?${query}` : "/training";
}
