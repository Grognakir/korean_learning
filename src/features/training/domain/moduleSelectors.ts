import type { LearningModuleDefinition, LearningTopicDefinition } from "@/types";

function compareByOrder<T extends { readonly sortOrder: number }>(left: T, right: T) {
  return left.sortOrder - right.sortOrder;
}

export function selectPublishedModules(
  modules: readonly LearningModuleDefinition[],
): readonly LearningModuleDefinition[] {
  return modules.filter((module) => module.status === "published").sort(compareByOrder);
}

export function selectPublishedTopics(
  module: LearningModuleDefinition,
): readonly LearningTopicDefinition[] {
  return module.topics.filter((topic) => topic.status === "published").sort(compareByOrder);
}
