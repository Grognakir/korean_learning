import type { PublicDictionaryEntry } from "../domain/types";

export type DictionaryQuery = {
  readonly unitSlug?: string;
  readonly lemma?: string;
};

export interface DictionaryRepository {
  list(query?: DictionaryQuery): Promise<readonly PublicDictionaryEntry[]>;
  getByLogicalId(logicalId: string): Promise<PublicDictionaryEntry | undefined>;
}
