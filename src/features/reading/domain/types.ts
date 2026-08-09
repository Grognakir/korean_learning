import type { ContentVersion, LocalizedText } from "@/types";

export type PublicReadingPassage = {
  readonly id: string;
  readonly logicalId: string;
  readonly unitSlug: string;
  readonly unitNumber: number;
  readonly title: LocalizedText;
  readonly bodyKo: string;
  readonly contentVersion: ContentVersion;
  readonly language: { readonly body: "ko"; readonly title: "ko" | "ru" };
};

export type PublicCurriculumExercise = {
  readonly id: string;
  readonly logicalId: string;
  readonly unitSlug: string;
  readonly skill: "grammar" | "vocabulary" | "reading";
  readonly exerciseType: string;
  readonly difficulty: "easy" | "medium" | "hard";
  readonly prompt: LocalizedText;
  readonly options: readonly {
    readonly id: string;
    readonly label: LocalizedText;
  }[];
  readonly readingPassageLogicalId: string | null;
  readonly grammarTopicLogicalId: string | null;
  readonly contentVersion: ContentVersion;
};
