export type { PublicDictionaryEntry } from "./domain/types";
export type {
  DictionaryPageResult,
  DictionaryQuery,
  DictionaryRepository,
} from "./data/DictionaryRepository";
export { LocalDictionaryRepository } from "./data/LocalDictionaryRepository";
export { parseDictionaryQuery, buildDictionaryHref } from "./presentation/parseDictionaryQuery";
export { withHomonymLabels } from "./presentation/homonymLabels";
