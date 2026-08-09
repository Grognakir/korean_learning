export type { ProgressRepository } from "./data/ProgressRepository";
export { createSupabaseProgressRepository } from "./data/SupabaseProgressRepository";
export { ProgressRepositoryError } from "./data/progressMapper";
export {
  ModuleProgressCard,
  ProgressEmptyState,
  ProgressGuestEmptyState,
  ProgressOverview,
  TopicProgressList,
} from "./components";
export type {
  ModuleProgressCardProps,
  ProgressOverviewProps,
  TopicProgressListProps,
} from "./components";
export {
  computeAccuracy,
  computeModuleMasteryStatus,
  computeTopicMasteryStatus,
  formatAccuracyPercent,
  hasAnyRecordedProgress,
  masteryStatusLabel,
  MASTERY_STATUSES,
} from "./domain";
export type {
  LearningProgressOverview,
  MasteryStatus,
  ModuleProgressSnapshot,
  TopicProgressSnapshot,
} from "./domain";
