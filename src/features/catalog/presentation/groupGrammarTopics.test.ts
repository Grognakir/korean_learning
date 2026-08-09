import { describe, expect, it } from "vitest";

import type { PublicGrammarTopicSummary } from "../domain/types";
import { groupGrammarTopics } from "./groupGrammarTopics";

function topic(
  overrides: Partial<PublicGrammarTopicSummary> &
    Pick<PublicGrammarTopicSummary, "logicalId" | "unitSlug" | "unitNumber" | "category">,
): PublicGrammarTopicSummary {
  return {
    id: overrides.id ?? overrides.logicalId,
    unitLogicalId: overrides.unitLogicalId ?? `unit.${overrides.unitSlug}`,
    patternKo: overrides.patternKo ?? "이에요",
    usageKey: overrides.usageKey ?? null,
    title: overrides.title ?? { ko: "제목", ru: "заголовок" },
    summary: overrides.summary ?? { ko: "요약", ru: "краткое" },
    contentVersion: overrides.contentVersion ?? "1.0.0",
    language: { pattern: "ko", summary: "ru" },
    ...overrides,
  };
}

describe("groupGrammarTopics", () => {
  it("groups by unit number then category", () => {
    const groups = groupGrammarTopics(
      [
        topic({ logicalId: "g2", unitSlug: "u02", unitNumber: 2, category: "particles" }),
        topic({ logicalId: "g1b", unitSlug: "u01", unitNumber: 1, category: "copula" }),
        topic({ logicalId: "g1a", unitSlug: "u01", unitNumber: 1, category: "copula" }),
        topic({ logicalId: "g1c", unitSlug: "u01", unitNumber: 1, category: "honorific" }),
      ],
      new Map([["u01", "приветствие"]]),
    );

    expect(groups.map((group) => group.unitNumber)).toEqual([1, 2]);
    expect(groups[0]?.unitTitleRu).toBe("приветствие");
    expect(groups[0]?.categories.map((entry) => entry.category)).toEqual(["copula", "honorific"]);
    expect(groups[0]?.categories[0]?.topics.map((entry) => entry.logicalId)).toEqual([
      "g1a",
      "g1b",
    ]);
  });
});
