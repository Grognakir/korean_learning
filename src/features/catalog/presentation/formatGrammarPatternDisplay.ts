const CIRCLED_MARK = /([①②③④⑤⑥⑦⑧⑨⑩])/gu;

/** Inserts a visual gap before sense marks like ① without changing stored patternKo. */
export function formatGrammarPatternDisplay(patternKo: string): string {
  return patternKo.replace(CIRCLED_MARK, " $1").replace(/\s{2,}/g, " ").trim();
}
