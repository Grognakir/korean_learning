import type { SupportedLanguage } from "@/types";

export const EXERCISE_SCHEMA_VERSION = 1 as const;
export const EXERCISE_DIFFICULTIES = ["easy", "medium", "hard"] as const;

export type ExerciseSchemaVersion = typeof EXERCISE_SCHEMA_VERSION;
export type ExerciseDifficulty = (typeof EXERCISE_DIFFICULTIES)[number];

export type ExerciseText = {
  readonly ko: string | null;
  readonly ru: string | null;
};

export type ExerciseScoring = {
  readonly points: number;
  readonly partialCredit: boolean;
};

export type AcceptedAnswer = {
  readonly id: string;
  readonly value: string;
  readonly isCanonical: boolean;
};

export type ExerciseOption = {
  readonly id: string;
  readonly label: ExerciseText;
};

export type MatchingPair = {
  readonly id: string;
  readonly left: ExerciseText;
  readonly right: ExerciseText;
};

export type FillBlankDefinition = {
  readonly id: string;
  readonly acceptedAnswers: readonly AcceptedAnswer[];
};

type ExerciseBase<Type extends string> = {
  readonly schemaVersion: ExerciseSchemaVersion;
  readonly id: string;
  readonly logicalId: string;
  readonly moduleSlug: string;
  readonly topicIds: readonly string[];
  readonly type: Type;
  readonly difficulty: ExerciseDifficulty;
  readonly prompt: ExerciseText;
  readonly explanation: ExerciseText;
  readonly contentVersion: `${number}.${number}.${number}`;
  readonly scoring: ExerciseScoring;
};

export type FreeResponseExercise = ExerciseBase<"free-response"> & {
  readonly answerLanguage: SupportedLanguage;
  readonly acceptedAnswers: readonly AcceptedAnswer[];
};

export type MeaningChoiceExercise = ExerciseBase<"meaning-choice"> & {
  readonly options: readonly ExerciseOption[];
  readonly correctOptionId: string;
};

export type HonorificChoiceExercise = ExerciseBase<"honorific-choice"> & {
  readonly options: readonly ExerciseOption[];
  readonly correctOptionId: string;
};

export type PlainChoiceExercise = ExerciseBase<"plain-choice"> & {
  readonly options: readonly ExerciseOption[];
  readonly correctOptionId: string;
};

export type ExercisePassageSnapshot = {
  readonly logicalId: string;
  readonly title: ExerciseText;
  readonly bodyKo: string;
};

export type SingleChoiceExercise = ExerciseBase<"single-choice"> & {
  readonly options: readonly ExerciseOption[];
  readonly correctOptionId: string;
  readonly passage: ExercisePassageSnapshot | null;
};

export type MatchingTranslationExercise = ExerciseBase<"matching-translation"> & {
  readonly pairs: readonly MatchingPair[];
};

export type MatchingHonorificExercise = ExerciseBase<"matching-honorific"> & {
  readonly pairs: readonly MatchingPair[];
};

export type FillBlankExercise = ExerciseBase<"fill-blank"> & {
  readonly template: string;
  readonly templateLanguage: SupportedLanguage;
  readonly blanks: readonly FillBlankDefinition[];
};

export type ChoiceExercise =
  MeaningChoiceExercise | HonorificChoiceExercise | PlainChoiceExercise | SingleChoiceExercise;

export type MatchingExercise = MatchingTranslationExercise | MatchingHonorificExercise;

export type Exercise = FreeResponseExercise | ChoiceExercise | MatchingExercise | FillBlankExercise;
