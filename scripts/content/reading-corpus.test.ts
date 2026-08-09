import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import {
  loadPhase2ContentGraph,
  PHASE_2_CONTENT_ROOT,
  validatePhase2Content,
} from "./contentValidation";
import { extractMergeDecisions, parseCurriculumTexts } from "./parse-curriculum-texts";

const TEXTS_PATH = path.join(process.cwd(), "docs/CURRICULUM_TEXTS.md");
const REPORT_PATH = path.join(PHASE_2_CONTENT_ROOT, "reading-reconciliation.json");

describe("phase-2 reading corpus", () => {
  it("covers 16 units, appendix listening texts, and merge lineage", () => {
    const markdown = readFileSync(TEXTS_PATH, "utf8");
    const sections = parseCurriculumTexts(markdown);
    const decisions = extractMergeDecisions(markdown);
    const report = JSON.parse(readFileSync(REPORT_PATH, "utf8")) as {
      counts: { unitsPresent: number; appendixSections: number; examQuestions: number };
      mergeDecisions: unknown[];
      regressions: Record<string, boolean>;
    };

    expect(new Set(sections.map((section) => section.unitNumber).filter(Boolean)).size).toBe(16);
    expect(sections.some((section) => section.sectionKind === "appendix")).toBe(true);
    expect(report.counts.unitsPresent).toBe(16);
    expect(report.counts.appendixSections).toBe(16);
    expect(report.mergeDecisions.length).toBe(decisions.length);
    expect(decisions.length).toBeGreaterThanOrEqual(6);

    for (const [key, value] of Object.entries(report.regressions)) {
      expect(value, key).toBe(true);
    }
  });

  it("imports 5×20 draft reading exercises with private correct options and blank markers", () => {
    validatePhase2Content(PHASE_2_CONTENT_ROOT);
    const graph = loadPhase2ContentGraph(PHASE_2_CONTENT_ROOT);

    expect(graph.exercisesReading.items).toHaveLength(100);
    expect(graph.exercisesReading.items.every((exercise) => exercise.status === "draft")).toBe(
      true,
    );
    expect(graph.exercisesReading.items.every((exercise) => exercise.status !== "approved")).toBe(
      true,
    );
    expect(
      graph.exercisesReading.items.every(
        (exercise) =>
          exercise.exerciseType === "single-choice" &&
          exercise.options.length >= 2 &&
          Boolean(exercise.correctOptionId) &&
          exercise.options.some((option) => option.id === exercise.correctOptionId),
      ),
    ).toBe(true);

    const byVariant = new Map<string, number>();
    for (const exercise of graph.exercisesReading.items) {
      const match = exercise.logicalId.match(/exercise\.reading\.exam\.(v\d{2})\.q\d{2}/);
      expect(match).toBeTruthy();
      byVariant.set(match![1]!, (byVariant.get(match![1]!) ?? 0) + 1);
    }
    expect([...byVariant.values()]).toEqual([20, 20, 20, 20, 20]);

    const bodies = graph.readingPassages.items.map((passage) => passage.bodyKo).join("\n");
    expect(bodies).toContain("㉠");
    expect(bodies).toContain("이 꽃을");
    expect(bodies).toContain("앞으로 쭉 가면");
    expect(bodies).toContain("아, 바쁘겠어요.");

    const unitIds = new Set(graph.units.items.map((unit) => unit.logicalId));
    expect(graph.readingPassages.items.every((passage) => unitIds.has(passage.unitLogicalId))).toBe(
      true,
    );
    expect(
      graph.exercisesReading.items.every(
        (exercise) =>
          Boolean(exercise.readingPassageLogicalId) &&
          graph.readingPassages.items.some(
            (passage) => passage.logicalId === exercise.readingPassageLogicalId,
          ),
      ),
    ).toBe(true);
  });
});
