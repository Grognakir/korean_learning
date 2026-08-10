export type GrammarDetailEnrichment = {
  readonly bodyMd?: string | null;
};

export type GrammarTopicDetail = {
  readonly bodyMd: string;
};

export type GrammarDetailSource = {
  readonly patternKo: string;
  readonly summaryRu: string;
  readonly titleRu?: string;
  readonly enrichment?: GrammarDetailEnrichment | null | undefined;
};

/** Resolves the full docs body for a grammar topic. */
export function buildGrammarTopicDetail(source: GrammarDetailSource): GrammarTopicDetail {
  const bodyMd = source.enrichment?.bodyMd?.trim();
  if (bodyMd) {
    return { bodyMd };
  }

  const summary = (source.summaryRu || source.titleRu || "").trim();
  return {
    bodyMd: summary ? `## ${source.patternKo}\n\n${summary}` : `## ${source.patternKo}`,
  };
}
