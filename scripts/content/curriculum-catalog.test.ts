import { describe, expect, it } from "vitest";

import {
  loadPhase2ContentGraph,
  PHASE_2_CONTENT_ROOT,
  validatePhase2Content,
} from "./contentValidation";

const EXPECTED_COUNTS = [5, 4, 5, 5, 5, 6, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5] as const;

describe("phase-2 curriculum catalog coverage", () => {
  it("loads 16 draft units and 80 draft grammar topics with exact per-unit counts", () => {
    validatePhase2Content(PHASE_2_CONTENT_ROOT);
    const graph = loadPhase2ContentGraph(PHASE_2_CONTENT_ROOT);

    expect(graph.units.items).toHaveLength(16);
    expect(graph.grammarTopics.items).toHaveLength(80);

    const unitNumbers = graph.units.items.map((unit) => unit.unitNumber).sort((a, b) => a - b);
    expect(unitNumbers).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]);

    const slugs = graph.units.items.map((unit) => unit.slug);
    expect(new Set(slugs).size).toBe(16);
    expect(slugs.every((slug) => /^u(0[1-9]|1[0-6])$/.test(slug))).toBe(true);

    const logicalIds = graph.units.items.map((unit) => unit.logicalId);
    expect(new Set(logicalIds).size).toBe(16);
    expect(graph.units.items.every((unit) => unit.status === "draft")).toBe(true);
    expect(
      graph.units.items.every((unit) =>
        unit.sourceRefs.some((ref) => ref.sourceId === "src.curriculum-topics"),
      ),
    ).toBe(true);

    for (const [index, expected] of EXPECTED_COUNTS.entries()) {
      const unitLogicalId = `unit.u${String(index + 1).padStart(2, "0")}`;
      const topics = graph.grammarTopics.items.filter(
        (topic) => topic.unitLogicalId === unitLogicalId,
      );
      expect(topics, unitLogicalId).toHaveLength(expected);
      expect(topics.every((topic) => topic.status === "draft")).toBe(true);
      expect(
        topics.every((topic) =>
          topic.sourceRefs.some((ref) => ref.sourceId === "src.curriculum-grammar"),
        ),
      ).toBe(true);
    }

    const grammarIds = graph.grammarTopics.items.map((topic) => topic.logicalId);
    expect(new Set(grammarIds).size).toBe(80);
    expect(
      graph.grammarTopics.items.every((topic) => /^grammar\.u\d{2}\.n\d{2}$/.test(topic.logicalId)),
    ).toBe(true);

    const unitIdSet = new Set(logicalIds);
    expect(graph.grammarTopics.items.every((topic) => unitIdSet.has(topic.unitLogicalId))).toBe(
      true,
    );

    for (const topic of graph.grammarTopics.items) {
      const circled = topic.patternKo.match(/[①②③④⑤⑥⑦⑧⑨⑩]/)?.[0] ?? null;
      expect(topic.usageKey).toBe(circled);
    }

    const topicByPattern = new Map(
      graph.grammarTopics.items.map((topic) => [topic.patternKo, topic] as const),
    );
    expect(topicByPattern.get("N은/는①")?.usageKey).toBe("①");
    expect(topicByPattern.get("N은/는②")?.usageKey).toBe("②");
    expect(topicByPattern.get("N은/는①")?.usageKey).not.toBe(
      topicByPattern.get("N은/는②")?.usageKey,
    );

    const provenanceSubjects = new Set(graph.provenance.items.map((row) => row.subjectLogicalId));
    for (const unit of graph.units.items) {
      expect(provenanceSubjects.has(unit.logicalId)).toBe(true);
    }
    for (const topic of graph.grammarTopics.items) {
      expect(provenanceSubjects.has(topic.logicalId)).toBe(true);
    }

    expect(graph.units.items.every((unit) => unit.status !== "approved")).toBe(true);
    expect(graph.grammarTopics.items.every((topic) => topic.status !== "approved")).toBe(true);
  });
});
