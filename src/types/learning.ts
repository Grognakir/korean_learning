import type { SupportedLanguage } from "./language";

export const LEARNING_LEVELS = ["1급", "2급", "3급", "4급", "5급", "6급"] as const;

export const MODULE_STATUSES = ["draft", "reviewed", "published", "archived"] as const;

export const EXERCISE_TYPE_IDS = [
  "free-response",
  "meaning-choice",
  "honorific-choice",
  "plain-choice",
  "single-choice",
  "matching-translation",
  "matching-honorific",
  "fill-blank",
] as const;

export type LearningLevel = (typeof LEARNING_LEVELS)[number];
export type ModuleStatus = (typeof MODULE_STATUSES)[number];
export type ExerciseTypeId = (typeof EXERCISE_TYPE_IDS)[number];
export type ContentVersion = `${number}.${number}.${number}`;
export type LocalizedText = Readonly<Record<SupportedLanguage, string>>;

export type LearningTopicDefinition = {
  readonly id: string;
  readonly code: string;
  readonly title: LocalizedText;
  readonly summary: LocalizedText;
  readonly level: LearningLevel;
  readonly status: ModuleStatus;
  readonly contentVersion: ContentVersion;
  readonly sortOrder: number;
};

export type LearningModuleDefinition = {
  readonly id: string;
  readonly slug: string;
  readonly title: LocalizedText;
  readonly description: LocalizedText;
  readonly level: LearningLevel;
  readonly status: ModuleStatus;
  readonly contentVersion: ContentVersion;
  readonly sortOrder: number;
  readonly supportedExerciseTypes: readonly ExerciseTypeId[];
  readonly topics: readonly LearningTopicDefinition[];
};
