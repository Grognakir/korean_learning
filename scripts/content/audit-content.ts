import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import { spawnSync } from "node:child_process";

import {
  assertNoAppContentImports,
  loadPhase2ContentGraph,
  PHASE_2_CONTENT_ROOT,
  validatePhase2Content,
} from "./contentValidation";
import { containsAbsoluteLocalPath } from "./schemas";
import { KNOWN_HOMONYM_LEMMAS } from "./normalize-dictionary";

const ROOT = process.cwd();
const REPORT_PATH = path.join(PHASE_2_CONTENT_ROOT, "content-audit-report.json");

type StatusCounts = Record<string, number>;

function countByStatus(items: ReadonlyArray<{ status: string }>): StatusCounts {
  const counts: StatusCounts = {};
  for (const item of items) {
    counts[item.status] = (counts[item.status] ?? 0) + 1;
  }
  return counts;
}

function scanForAbsolutePaths(value: unknown, trail: string[], hits: string[]): void {
  if (typeof value === "string") {
    if (containsAbsoluteLocalPath(value)) {
      hits.push(`${trail.join(".")}: ${value}`);
    }
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((entry, index) => scanForAbsolutePaths(entry, [...trail, String(index)], hits));
    return;
  }

  if (value && typeof value === "object") {
    for (const [key, entry] of Object.entries(value)) {
      scanForAbsolutePaths(entry, [...trail, key], hits);
    }
  }
}

function loadJson(fileName: string): unknown {
  return JSON.parse(readFileSync(path.join(PHASE_2_CONTENT_ROOT, fileName), "utf8"));
}

validatePhase2Content();
assertNoAppContentImports();
const graph = loadPhase2ContentGraph();

const dictionaryReport = existsSync(
  path.join(PHASE_2_CONTENT_ROOT, "dictionary-reconciliation.json"),
)
  ? loadJson("dictionary-reconciliation.json")
  : null;
const readingReport = existsSync(path.join(PHASE_2_CONTENT_ROOT, "reading-reconciliation.json"))
  ? (loadJson("reading-reconciliation.json") as {
      regressions: Record<string, boolean>;
      counts: Record<string, number>;
    })
  : null;

const absolutePathHits: string[] = [];
for (const fileName of [
  "source-manifest.json",
  "units.json",
  "grammar-topics.json",
  "dictionary-entries.json",
  "dictionary-unit-links.json",
  "reading-passages.json",
  "exercises-grammar.json",
  "exercises-vocabulary.json",
  "exercises-reading.json",
  "provenance.json",
  "dictionary-reconciliation.json",
  "reading-reconciliation.json",
]) {
  const filePath = path.join(PHASE_2_CONTENT_ROOT, fileName);
  if (!existsSync(filePath)) {
    continue;
  }
  scanForAbsolutePaths(loadJson(fileName), [fileName], absolutePathHits);
}

const grammarCounts = [5, 4, 5, 5, 5, 6, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5] as const;
const perUnitGrammar = grammarCounts.map((expected, index) => {
  const unitLogicalId = `unit.u${String(index + 1).padStart(2, "0")}`;
  const actual = graph.grammarTopics.items.filter(
    (topic) => topic.unitLogicalId === unitLogicalId,
  ).length;
  return { unitLogicalId, expected, actual, ok: actual === expected };
});

const notApproved = {
  units: graph.units.items.filter((item) => item.status !== "approved").length,
  grammarTopics: graph.grammarTopics.items.filter((item) => item.status !== "approved").length,
  dictionaryEntries: graph.dictionaryEntries.items.filter((item) => item.status !== "approved")
    .length,
  readingPassages: graph.readingPassages.items.filter((item) => item.status !== "approved").length,
  exercisesReading: graph.exercisesReading.items.filter((item) => item.status !== "approved")
    .length,
  exercisesGrammar: graph.exercisesGrammar.items.filter((item) => item.status !== "approved")
    .length,
  exercisesVocabulary: graph.exercisesVocabulary.items.filter((item) => item.status !== "approved")
    .length,
};

const vocabularyBoundary = {
  totalSenses: graph.dictionaryEntries.items.length,
  approved: graph.dictionaryEntries.items.filter((item) => item.status === "approved").length,
  businessDraft: graph.dictionaryEntries.items.filter((item) => item.level === "business-draft")
    .length,
  knownHomonyms: KNOWN_HOMONYM_LEMMAS.map((lemma) => ({
    lemma,
    senseCount: graph.dictionaryEntries.items.filter((entry) => entry.lemma === lemma).length,
  })),
  note: "No dictionary senses are approved yet. Business lexicon remains draft (level=business-draft).",
};

const importedReadingExercises = graph.exercisesReading.items.filter((item) =>
  item.logicalId.startsWith("exercise.reading.exam."),
);
const baselineReadingExercises = graph.exercisesReading.items.filter((item) =>
  item.logicalId.startsWith("exercise.reading.bank."),
);

const report = {
  schemaVersion: "phase-2.content-audit.v1",
  generatedAt: new Date().toISOString(),
  auditDoc: "docs/PHASE_2_CONTENT_AUDIT.md",
  canonicalDocuments: [
    "docs/CURRICULUM_TOPICS.md",
    "docs/CURRICULUM_GRAMMAR.md",
    "docs/CURRICULUM_VOCABULARY.md",
    "docs/CURRICULUM_TEXTS.md",
  ],
  checkpoint: {
    id: "CP-6",
    status: "accepted",
    acceptedAt: "2026-08-09",
    blocks: [
      "status promotions to approved without language review",
      "remote supabase seed/migration without explicit step",
    ],
  },
  counts: {
    units: {
      total: graph.units.items.length,
      byStatus: countByStatus(graph.units.items),
    },
    grammarTopics: {
      total: graph.grammarTopics.items.length,
      byStatus: countByStatus(graph.grammarTopics.items),
      perUnit: perUnitGrammar,
    },
    dictionaryEntries: {
      total: graph.dictionaryEntries.items.length,
      byStatus: countByStatus(graph.dictionaryEntries.items),
      unitLinks: graph.dictionaryUnitLinks.items.length,
    },
    readingPassages: {
      total: graph.readingPassages.items.length,
      byStatus: countByStatus(graph.readingPassages.items),
      textbookOrAppendix: graph.readingPassages.items.filter((item) =>
        item.logicalId.startsWith("passage.u"),
      ).length,
      exam: graph.readingPassages.items.filter((item) => item.logicalId.startsWith("passage.exam."))
        .length,
    },
    exercises: {
      grammar: graph.exercisesGrammar.items.length,
      vocabulary: graph.exercisesVocabulary.items.length,
      reading: graph.exercisesReading.items.length,
      readingByStatus: countByStatus(graph.exercisesReading.items),
    },
  },
  correspondence: {
    topicsUnits: graph.units.items.length === 16,
    grammarTopics: graph.grammarTopics.items.length === 80,
    grammarPerUnitExact: perUnitGrammar.every((row) => row.ok),
    dictionarySenses: graph.dictionaryEntries.items.length > 1000,
    readingExamQuestions: importedReadingExercises.length === 100,
    readingBaselineQuestions: baselineReadingExercises.length === 48,
    readingRegressions: readingReport?.regressions ?? null,
  },
  notApprovedSummary: notApproved,
  vocabularyBoundary,
  security: {
    absoluteLocalPathHits: absolutePathHits,
    appContentImportScan: "passed",
  },
  openQuestionsForCp6: [
    "Confirm 16 units / 80 grammar catalog structure against CURRICULUM_TOPICS.md and CURRICULUM_GRAMMAR.md.",
    "Confirm dictionary homonyms and business-draft boundary before any approval.",
    "Confirm reading merge decisions and exam bank remain draft until language review.",
    "Decide which metadata (if any) may move to reviewed after CP-6; none are approved yet.",
  ],
  derivedReportsPresent: {
    dictionaryReconciliation: Boolean(dictionaryReport),
    readingReconciliation: Boolean(readingReport),
  },
};

writeFileSync(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`, "utf8");
spawnSync("corepack", ["pnpm", "exec", "prettier", "--write", REPORT_PATH], {
  cwd: ROOT,
  encoding: "utf8",
});

const failures: string[] = [];
if (!report.correspondence.topicsUnits) failures.push("expected 16 units");
if (!report.correspondence.grammarTopics) failures.push("expected 80 grammar topics");
if (!report.correspondence.grammarPerUnitExact) failures.push("grammar per-unit counts mismatch");
if (!report.correspondence.readingExamQuestions) failures.push("expected 100 reading exercises");
if (!report.correspondence.readingBaselineQuestions) {
  failures.push("expected 48 baseline reading exercises");
}
if (absolutePathHits.length > 0) failures.push("absolute local paths found in content JSON");
if (readingReport) {
  for (const [key, value] of Object.entries(readingReport.regressions)) {
    if (!value) failures.push(`reading regression failed: ${key}`);
  }
}

if (failures.length > 0) {
  console.error(`Content audit failed:\n- ${failures.join("\n- ")}`);
  process.exit(1);
}

console.log(
  [
    "Content audit passed structural gates.",
    `Report: ${path.relative(ROOT, REPORT_PATH)}`,
    "CP-6 status: accepted",
    `Not approved: units=${notApproved.units}, grammar=${notApproved.grammarTopics}, dictionary=${notApproved.dictionaryEntries}, passages=${notApproved.readingPassages}, readingExercises=${notApproved.exercisesReading}`,
  ].join("\n"),
);
