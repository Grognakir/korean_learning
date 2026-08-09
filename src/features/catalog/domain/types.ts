import type { ContentVersion, LocalizedText } from "@/types";

export type LearningSkillId = "grammar" | "vocabulary" | "reading";

export type CatalogContentCounts = {
  readonly grammarTopics: number;
  readonly dictionaryEntries: number;
  readonly readingPassages: number;
  readonly approvedExercises: number;
};

export type PublicUnitSummary = {
  readonly id: string;
  readonly logicalId: string;
  readonly slug: string;
  readonly unitNumber: number;
  readonly title: LocalizedText;
  readonly summary: LocalizedText;
  readonly level: "1급";
  readonly contentVersion: ContentVersion;
  readonly counts: CatalogContentCounts;
};

export type PublicGrammarTopicSummary = {
  readonly id: string;
  readonly logicalId: string;
  readonly unitLogicalId: string;
  readonly unitSlug: string;
  readonly unitNumber: number;
  readonly patternKo: string;
  readonly category: string;
  readonly usageKey: string | null;
  readonly title: LocalizedText;
  readonly summary: LocalizedText;
  readonly contentVersion: ContentVersion;
  readonly language: { readonly pattern: "ko"; readonly summary: "ru" };
};

export type CatalogQuery = {
  readonly unitSlug?: string;
  readonly grammarTopicId?: string;
  readonly learningSkill?: LearningSkillId;
  readonly difficulty?: "easy" | "medium" | "hard";
};

export type CatalogListResult<T> =
  | { readonly status: "ready"; readonly items: readonly T[] }
  | { readonly status: "not_found" }
  | { readonly status: "empty"; readonly items: readonly [] };
