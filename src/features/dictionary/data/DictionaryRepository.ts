import type { PublicDictionaryEntry } from "../domain/types";

export type DictionaryQuery = {
  readonly unitSlug?: string;
  readonly pos?: string;
  readonly lemma?: string;
  readonly page?: number;
  readonly pageSize?: number;
};

export type DictionaryPageResult = {
  readonly items: readonly PublicDictionaryEntry[];
  readonly total: number;
  readonly page: number;
  readonly pageSize: number;
  readonly posOptions: readonly string[];
  /** Lemmas with more than one published sense in the filtered set (not only the page). */
  readonly homonymLemmas: readonly string[];
};

export interface DictionaryRepository {
  list(query?: DictionaryQuery): Promise<readonly PublicDictionaryEntry[]>;
  listPage(query?: DictionaryQuery): Promise<DictionaryPageResult>;
  getByLogicalId(logicalId: string): Promise<PublicDictionaryEntry | undefined>;
}
