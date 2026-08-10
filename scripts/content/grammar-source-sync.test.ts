import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { loadPhase2ContentGraph, PHASE_2_CONTENT_ROOT } from "./contentValidation";

const ROOT = process.cwd();
const GRAMMAR_DOC = path.join(ROOT, "docs", "CURRICULUM_GRAMMAR.md");
const ENRICHMENT = path.join(PHASE_2_CONTENT_ROOT, "grammar-detail-enrichment.json");

const FORBIDDEN = [
  "귀엽웁니다",
  "도오",
  "도올",
  "십시요",
  "AV-(으)로 가다/오다",
  "매일 = завтра",
  "notion.so",
] as const;

describe("grammar source sync invariants", () => {
  const graph = loadPhase2ContentGraph();
  const grammarDoc = readFileSync(GRAMMAR_DOC, "utf8");
  const enrichment = JSON.parse(readFileSync(ENRICHMENT, "utf8")) as {
    matched: number;
    withExpanded: number;
    total: number;
    items: Record<string, { bodyMd?: string }>;
  };

  it("keeps 16 units and 80 grammar topics with stable logicalIds", () => {
    expect(graph.units.items).toHaveLength(16);
    expect(graph.grammarTopics.items).toHaveLength(80);

    const ids = graph.grammarTopics.items.map((topic) => topic.logicalId).sort();
    expect(ids).toHaveLength(80);
    expect(new Set(ids).size).toBe(80);
    expect(ids.every((id) => /^grammar\.u\d{2}\.n\d{2}$/.test(id))).toBe(true);
  });

  it("uses corrected display patterns for u14.n04, u15.n04, u16.n05", () => {
    const byId = new Map(graph.grammarTopics.items.map((topic) => [topic.logicalId, topic]));
    expect(byId.get("grammar.u14.n04")?.patternKo).toBe("V-아/어/여야 되다/하다");
    expect(byId.get("grammar.u15.n04")?.patternKo).toBe("V-아/어/여도 되다(좋다, 괜찮다)");
    expect(byId.get("grammar.u16.n05")?.patternKo).toBe("AV-아/어/여 드리다/주시다");
  });

  it("keeps merged atoms for u15.n02, u16.n03, u16.n05", () => {
    const byId = new Map(graph.grammarTopics.items.map((topic) => [topic.logicalId, topic]));
    expect(byId.get("grammar.u15.n02")?.patternKo).toBe("V-지만/N(이)지만");
    expect(byId.get("grammar.u16.n03")?.patternKo).toBe("V-(으)ㄴ/는데/N인데");
    expect(byId.get("grammar.u16.n05")?.patternKo).toContain("드리다/주시다");
  });

  it("has expanded enrichment bodies for lessons 13–16", () => {
    expect(enrichment.matched).toBe(80);
    expect(enrichment.total).toBe(80);

    for (const unit of [13, 14, 15, 16]) {
      for (const index of [1, 2, 3, 4, 5]) {
        const logicalId = `grammar.u${String(unit).padStart(2, "0")}.n${String(index).padStart(2, "0")}`;
        const body = enrichment.items[logicalId]?.bodyMd ?? "";
        expect(body.length, logicalId).toBeGreaterThan(120);
        expect(body).toMatch(/Значение|Правил|Пример/u);
      }
    }
  });

  it("does not reintroduce known incorrect forms or Notion links in learner-facing grammar content", () => {
    const corpus = [
      grammarDoc,
      ...Object.values(enrichment.items).map((item) => item.bodyMd ?? ""),
      ...graph.grammarTopics.items.map((topic) => `${topic.patternKo}\n${topic.summary?.ru ?? ""}`),
    ].join("\n");

    for (const bad of FORBIDDEN) {
      if (bad === "십시요" || bad === "AV-(으)로 가다/오다") {
        // Editorial notes may mention the incorrect form as forbidden.
        const occurrences = corpus.split(bad).length - 1;
        expect(occurrences, bad).toBeLessThanOrEqual(2);
        continue;
      }
      expect(corpus.includes(bad), bad).toBe(false);
    }

    expect(corpus).not.toContain("V-아/어/야 되다/하다");
    expect(corpus).not.toContain("AV-아/어/여 드리다/주다");
  });
});
