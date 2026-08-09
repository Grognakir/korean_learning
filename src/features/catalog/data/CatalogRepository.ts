import type {
  CatalogListResult,
  CatalogQuery,
  PublicGrammarTopicSummary,
  PublicUnitSummary,
} from "../domain/types";

export interface CatalogRepository {
  listUnits(): Promise<CatalogListResult<PublicUnitSummary>>;
  getUnitBySlug(slug: string): Promise<PublicUnitSummary | undefined>;
  listGrammarTopics(query?: CatalogQuery): Promise<CatalogListResult<PublicGrammarTopicSummary>>;
  getGrammarTopicByLogicalId(logicalId: string): Promise<PublicGrammarTopicSummary | undefined>;
  aggregateCounts(): Promise<{
    readonly units: number;
    readonly grammarTopics: number;
    readonly dictionaryEntries: number;
    readonly readingPassages: number;
    readonly approvedExercises: number;
  }>;
}
