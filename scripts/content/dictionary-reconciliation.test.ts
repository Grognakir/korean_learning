import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import {
  loadPhase2ContentGraph,
  PHASE_2_CONTENT_ROOT,
  validatePhase2Content,
} from "./contentValidation";
import {
  DERIVED_COVERAGE_EXPECTATIONS,
  KNOWN_HOMONYM_LEMMAS,
  buildDictionaryReconciliationReport,
  classifyVocabularyRows,
  parseVocabularyMarkdown,
  type DictionaryReconciliationReport,
} from "./normalize-dictionary";

const VOCAB_PATH = path.join(process.cwd(), "docs/CURRICULUM_VOCABULARY.md");
const REPORT_PATH = path.join(PHASE_2_CONTENT_ROOT, "dictionary-reconciliation.json");

describe("phase-2 dictionary reconciliation", () => {
  it("classifies every CURRICULUM_VOCABULARY.md table row", () => {
    const markdown = readFileSync(VOCAB_PATH, "utf8");
    const rows = parseVocabularyMarkdown(markdown);
    const classified = classifyVocabularyRows(rows);
    const report = buildDictionaryReconciliationReport(classified);

    expect(rows.length).toBeGreaterThan(1000);
    expect(classified).toHaveLength(rows.length);
    expect(
      classified.every((item) =>
        ["canonical_sense", "relation", "duplicate_source_record"].includes(item.classification),
      ),
    ).toBe(true);
    expect(
      report.counts.canonicalSenses +
        report.counts.relations +
        report.counts.duplicateSourceRecords,
    ).toBe(rows.length);
    expect(report.counts.relations).toBe(50);
    expect(report.forbiddenCategoriesAbsent).toContain("добавлено");
    expect(report.rows.some((row) => row.categoryKey === "добавлено")).toBe(false);
    expect(markdown.includes("| добавлено |")).toBe(false);
  });

  it("keeps derived 803/731/179 counts coverage-only in the checked-in report", () => {
    const report = JSON.parse(readFileSync(REPORT_PATH, "utf8")) as DictionaryReconciliationReport;

    expect(report.derivedCoverage.vocabTrainerCards.expected).toBe(
      DERIVED_COVERAGE_EXPECTATIONS.vocabTrainerCards,
    );
    expect(report.derivedCoverage.quizletTsvRows.expected).toBe(
      DERIVED_COVERAGE_EXPECTATIONS.quizletTsvRows,
    );
    expect(report.derivedCoverage.flashcardCards.expected).toBe(
      DERIVED_COVERAGE_EXPECTATIONS.flashcardCards,
    );
    expect(report.derivedCoverage.vocabTrainerCards.artifactsPresent).toBe(false);
    expect(report.derivedCoverage.quizletTsvRows.role).toBe("coverage-only");
  });

  it("approves only primary senses and links only to known units", () => {
    validatePhase2Content(PHASE_2_CONTENT_ROOT);
    const graph = loadPhase2ContentGraph(PHASE_2_CONTENT_ROOT);
    const report = JSON.parse(readFileSync(REPORT_PATH, "utf8")) as DictionaryReconciliationReport;

    expect(graph.dictionaryEntries.items.length).toBe(report.counts.canonicalSenses);
    const primaryIds = new Set(
      graph.dictionaryUnitLinks.items
        .filter((link) => link.role === "primary")
        .map((link) => link.entryLogicalId),
    );
    expect(
      graph.dictionaryEntries.items.every((entry) =>
        primaryIds.has(entry.logicalId)
          ? entry.status === "approved"
          : entry.status === "draft" || entry.status === "reviewed",
      ),
    ).toBe(true);
    expect(graph.dictionaryEntries.items.some((entry) => entry.status === "draft")).toBe(true);
    expect(graph.dictionaryUnitLinks.items.length).toBeGreaterThanOrEqual(192);

    const unitIds = new Set(graph.units.items.map((unit) => unit.logicalId));
    const entryIds = new Set(graph.dictionaryEntries.items.map((entry) => entry.logicalId));
    expect(graph.dictionaryUnitLinks.items.every((link) => unitIds.has(link.unitLogicalId))).toBe(
      true,
    );
    expect(graph.dictionaryUnitLinks.items.every((link) => entryIds.has(link.entryLogicalId))).toBe(
      true,
    );

    for (const lemma of KNOWN_HOMONYM_LEMMAS) {
      const senses = graph.dictionaryEntries.items.filter((entry) => entry.lemma === lemma);
      expect(senses.length).toBeGreaterThanOrEqual(2);
      expect(new Set(senses.map((entry) => entry.senseKey)).size).toBe(senses.length);
    }

    expect(graph.dictionaryEntries.items.some((entry) => entry.level === "business-draft")).toBe(
      true,
    );
    expect(
      graph.provenance.items.filter((row) => row.subjectLogicalId.startsWith("dict.")).length,
    ).toBe(graph.dictionaryEntries.items.length);
  });
});
