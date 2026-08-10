import { describe, expect, it } from "vitest";

import { buildGrammarTopicDetail } from "./grammarDetail";

describe("buildGrammarTopicDetail", () => {
  it("uses the full docs body when enrichment is present", () => {
    const detail = buildGrammarTopicDetail({
      patternKo: "V-아/어/여야 되다/하다",
      summaryRu: "выражает обязанность или необходимость.",
      enrichment: {
        bodyMd:
          '## V-아/어/여야 되다/하다 — "должен, нужно"\n\n#### **Значение грамматики**\n\nнеобходимость.',
      },
    });

    expect(detail.bodyMd).toContain("V-아/어/여야 되다/하다");
    expect(detail.bodyMd).toContain("Значение грамматики");
  });

  it("falls back to pattern + summary when enrichment is missing", () => {
    const detail = buildGrammarTopicDetail({
      patternKo: "N입니다/입니까?",
      summaryRu: "формальная связка.",
    });

    expect(detail.bodyMd).toContain("N입니다/입니까?");
    expect(detail.bodyMd).toContain("формальная связка.");
  });
});
