import type { LearningSkillId } from "../domain/types";

export type TrainingSetupQuery = {
  readonly skill: LearningSkillId;
  readonly unitSlug: string;
  readonly grammarTopicId?: string;
};

/** Stable training setup URL for F2-I13+; unknown params must not invent content. */
export function buildTrainingSetupHref(query: TrainingSetupQuery): string {
  const params = new URLSearchParams();
  params.set("skill", query.skill);
  params.set("unit", query.unitSlug);
  if (query.grammarTopicId) {
    params.set("grammar", query.grammarTopicId);
  }
  return `/training?${params.toString()}`;
}
