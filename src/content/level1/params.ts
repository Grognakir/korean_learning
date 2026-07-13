import { grammar } from "./grammar";
import { topics } from "./topics";
import { vocabDomains } from "./vocab";

export const LEVEL_IDS = ["1"] as const;

export function levelParams() {
  return LEVEL_IDS.map((levelId) => ({ levelId }));
}

export function grammarParams(levelId = "1") {
  return grammar.map((g) => ({ levelId, grammarId: g.id }));
}

export function topicParams(levelId = "1") {
  return topics.map((t) => ({ levelId, topicId: t.id }));
}

export function domainParams(levelId = "1") {
  return vocabDomains.map((d) => ({ levelId, domainId: d.id }));
}
