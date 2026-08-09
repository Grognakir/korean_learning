import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import {
  buildDictionaryReconciliationReport,
  classifyVocabularyRows,
  parseVocabularyMarkdown,
  type ClassifiedVocabularyRow,
} from "./normalize-dictionary";

const ROOT = process.cwd();
const CONTENT_DIR = path.join(ROOT, "content", "phase-2");

function formatWithPrettier(fileNames: readonly string[]): void {
  const result = spawnSync(
    "corepack",
    [
      "pnpm",
      "exec",
      "prettier",
      "--write",
      ...fileNames.map((name) => path.join(CONTENT_DIR, name)),
    ],
    { cwd: ROOT, encoding: "utf8" },
  );
  if (result.status !== 0) {
    throw new Error(result.stderr || result.stdout || "prettier failed on dictionary outputs");
  }
}

function sourceRef(locatorValue: string) {
  return {
    sourceId: "src.curriculum-vocabulary",
    locator: { kind: "line-range" as const, value: locatorValue },
    confidence: "high" as const,
  };
}

function writeJson(fileName: string, value: unknown): void {
  writeFileSync(path.join(CONTENT_DIR, fileName), `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function buildDictionaryEntries(classified: readonly ClassifiedVocabularyRow[]) {
  return {
    schemaVersion: "phase-2.v1",
    items: classified
      .filter((item) => item.classification === "canonical_sense")
      .map((item) => ({
        logicalId: item.logicalId!,
        contentVersion: "1.0.0",
        status: "draft" as const,
        sourceRefs: [sourceRef(`L${item.row.lineNumber}`)],
        lemma: item.row.lemma,
        senseKey: item.senseKey!,
        gloss: {
          ko: item.row.lemma,
          ru: item.row.translationRu,
        },
        transliteration: item.row.transliteration,
        level: item.category.key === "business" ? "business-draft" : null,
        pos: item.category.defaultPos,
      })),
  };
}

function buildDictionaryProvenance(classified: readonly ClassifiedVocabularyRow[]) {
  return classified
    .filter((item) => item.classification === "canonical_sense")
    .map((item) => ({
      logicalId: `prov.${item.logicalId}`,
      subjectLogicalId: item.logicalId!,
      contentVersion: "1.0.0",
      sourceRefs: [sourceRef(`L${item.row.lineNumber}`)],
      notes: `Draft sense from category ${item.category.key}; notes=${item.row.notes || "none"}`,
    }));
}

const markdown = readFileSync(path.join(ROOT, "docs/CURRICULUM_VOCABULARY.md"), "utf8");
const rows = parseVocabularyMarkdown(markdown);
const classified = classifyVocabularyRows(rows);
const report = buildDictionaryReconciliationReport(classified);
const dictionaryEntries = buildDictionaryEntries(classified);
const dictionaryUnitLinks = {
  schemaVersion: "phase-2.v1",
  items: [],
};

const units = JSON.parse(readFileSync(path.join(CONTENT_DIR, "units.json"), "utf8")) as {
  items: Array<{
    logicalId: string;
    contentVersion: string;
    sourceRefs: unknown[];
  }>;
};
const grammarTopics = JSON.parse(
  readFileSync(path.join(CONTENT_DIR, "grammar-topics.json"), "utf8"),
) as {
  items: Array<{
    logicalId: string;
    contentVersion: string;
    sourceRefs: unknown[];
  }>;
};

const provenance = {
  schemaVersion: "phase-2.v1",
  items: [
    ...units.items.map((unit) => ({
      logicalId: `prov.${unit.logicalId}`,
      subjectLogicalId: unit.logicalId,
      contentVersion: unit.contentVersion,
      sourceRefs: unit.sourceRefs,
      notes: "Imported from CURRICULUM_TOPICS.md as draft catalog metadata.",
    })),
    ...grammarTopics.items.map((topic) => ({
      logicalId: `prov.${topic.logicalId}`,
      subjectLogicalId: topic.logicalId,
      contentVersion: topic.contentVersion,
      sourceRefs: topic.sourceRefs,
      notes: "Imported from CURRICULUM_GRAMMAR.md short catalog as draft.",
    })),
    ...buildDictionaryProvenance(classified),
  ],
};

writeJson("dictionary-entries.json", dictionaryEntries);
writeJson("dictionary-unit-links.json", dictionaryUnitLinks);
writeJson("dictionary-reconciliation.json", report);
writeJson("provenance.json", provenance);
formatWithPrettier([
  "dictionary-entries.json",
  "dictionary-unit-links.json",
  "dictionary-reconciliation.json",
  "provenance.json",
]);

console.log(
  [
    `Wrote dictionary draft: ${dictionaryEntries.items.length} senses`,
    `${report.counts.relations} irregular relations`,
    `${report.counts.duplicateSourceRecords} duplicate source rows`,
    `unit links=${dictionaryUnitLinks.items.length}`,
    `provenance=${provenance.items.length}`,
  ].join(", "),
);
