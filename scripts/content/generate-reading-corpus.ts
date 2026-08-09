import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import {
  extractMergeDecisions,
  parseCurriculumTexts,
  slugifySection,
} from "./parse-curriculum-texts";
import { parseReadingHtml, suggestedUnitForVariant } from "./parse-reading-html";

const ROOT = process.cwd();
const CONTENT_DIR = path.join(ROOT, "content", "phase-2");

function sourceRef(
  sourceId: string,
  locatorValue: string,
  kind: "section" | "line-range" = "section",
) {
  return {
    sourceId,
    locator: { kind, value: locatorValue },
    confidence: "high" as const,
  };
}

function writeJson(fileName: string, value: unknown): void {
  writeFileSync(path.join(CONTENT_DIR, fileName), `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

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
    throw new Error(result.stderr || result.stdout || "prettier failed on reading outputs");
  }
}

function resolveReadingHtmlPath(): string {
  const fromEnv = process.env.READING_HTML_PATH?.trim();
  if (fromEnv && existsSync(fromEnv)) {
    return fromEnv;
  }

  const local = path.join(ROOT, "tmp", "korean_reading_test.html");
  if (existsSync(local)) {
    return local;
  }

  throw new Error(
    "Reading HTML not found. Set READING_HTML_PATH or place file at tmp/korean_reading_test.html",
  );
}

const textsMarkdown = readFileSync(path.join(ROOT, "docs/CURRICULUM_TEXTS.md"), "utf8");
const mergeDecisions = extractMergeDecisions(textsMarkdown);
const textSections = parseCurriculumTexts(textsMarkdown);

const textbookPassages = textSections.map((section, index) => {
  const unitNumber = section.unitNumber;
  if (!unitNumber) {
    throw new Error(`Passage without unit at line ${section.lineStart}: ${section.sectionHeading}`);
  }

  const unitPad = String(unitNumber).padStart(2, "0");
  const kind = section.sectionKind === "appendix" ? "appendix" : "section";
  const logicalId = `passage.u${unitPad}.${kind}.${slugifySection(section.sectionHeading, index + 1)}`;
  const needsReview =
    unitNumber === 9 ||
    unitNumber === 13 ||
    section.hasBlankMarkers ||
    section.sectionKind === "appendix";

  return {
    logicalId,
    contentVersion: "1.0.0",
    status: needsReview ? ("needs_review" as const) : ("draft" as const),
    sourceRefs: [sourceRef("src.curriculum-texts", `L${section.lineStart}`, "line-range")],
    review: needsReview
      ? {
          note:
            unitNumber === 9
              ? "Preserve blank markers and 이 꽃 until manual verification."
              : unitNumber === 13
                ? "Preserve 앞으로 쭉 가면 until manual verification."
                : section.sectionKind === "appendix"
                  ? "Appendix listening transcript imported as reading passage draft."
                  : "Passage contains blank markers; verify before approval.",
        }
      : undefined,
    unitLogicalId: `unit.u${unitPad}`,
    title: {
      ko: section.titleKo,
      ru: section.titleRu,
    },
    bodyKo: section.bodyKo,
    bodyRu: null,
  };
});

const readingPassagesFromTexts = textbookPassages;

const htmlPath = resolveReadingHtmlPath();
const htmlVariants = parseReadingHtml(readFileSync(htmlPath, "utf8"));

const examPassages: Array<{
  logicalId: string;
  contentVersion: string;
  status: "draft";
  sourceRefs: ReturnType<typeof sourceRef>[];
  unitLogicalId: string;
  title: { ko: string; ru: string };
  bodyKo: string;
  bodyRu: null;
}> = [];
const examPassageByGroup = new Map<string, string>();

for (const variant of htmlVariants) {
  const unitPad = String(suggestedUnitForVariant(variant.index - 1)).padStart(2, "0");
  for (const question of variant.questions) {
    if (examPassageByGroup.has(question.passageGroupKey)) {
      continue;
    }
    const groupSlug = question.passageGroupKey
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    const logicalId = `passage.exam.v${String(variant.index).padStart(2, "0")}.${groupSlug}`;
    examPassageByGroup.set(question.passageGroupKey, logicalId);
    examPassages.push({
      logicalId,
      contentVersion: "1.0.0",
      status: "draft",
      sourceRefs: [
        sourceRef("src.curriculum-texts", `derived.reading-html.v${variant.index}`, "section"),
      ],
      unitLogicalId: `unit.u${unitPad}`,
      title: {
        ko: `${variant.label} · ${question.section}`,
        ru: `Exam variant ${variant.index} passage`,
      },
      bodyKo: question.passageKo,
      bodyRu: null,
    });
  }
}

const readingPassages = {
  schemaVersion: "phase-2.v1",
  items: [...readingPassagesFromTexts, ...examPassages],
};

const exercisesReading = {
  schemaVersion: "phase-2.v1",
  items: htmlVariants.flatMap((variant) =>
    variant.questions.map((question) => {
      const variantPad = String(variant.index).padStart(2, "0");
      const questionPad = String(question.questionNumber).padStart(2, "0");
      const unitPad = String(suggestedUnitForVariant(variant.index - 1)).padStart(2, "0");
      const options = question.options.map((label, optionIndex) => ({
        id: `opt${optionIndex + 1}`,
        label: { ko: label, ru: label },
      }));
      const correctOptionId = `opt${question.correctOptionIndex + 1}`;
      const explanationRu =
        question.explanationKo ||
        "Draft reading question imported from derived HTML bank; not language-approved.";

      return {
        logicalId: `exercise.reading.exam.v${variantPad}.q${questionPad}`,
        contentVersion: "1.0.0",
        status: "draft" as const,
        sourceRefs: [
          sourceRef(
            "src.curriculum-texts",
            `derived.reading-html.v${variant.index}.q${question.questionNumber}`,
            "section",
          ),
        ],
        skill: "reading" as const,
        exerciseType: "single-choice" as const,
        unitLogicalId: `unit.u${unitPad}`,
        grammarTopicLogicalId: null,
        readingPassageLogicalId: examPassageByGroup.get(question.passageGroupKey)!,
        dictionaryEntryLogicalIds: [],
        prompt: {
          ko: question.promptKo,
          ru: question.promptKo,
        },
        explanation: {
          ko: question.explanationKo || explanationRu,
          ru: explanationRu,
        },
        difficulty: "practice" as const,
        options,
        correctOptionId,
        acceptedAnswers: [],
      };
    }),
  ),
};

const report = {
  schemaVersion: "phase-2.reading-reconciliation.v1",
  generatedFrom: {
    canonicalTexts: "docs/CURRICULUM_TEXTS.md",
    derivedHtml: path.relative(ROOT, htmlPath),
  },
  mergeDecisions,
  counts: {
    textSections: textSections.length,
    textbookPassages: readingPassagesFromTexts.length,
    examPassages: examPassages.length,
    readingPassages: readingPassages.items.length,
    examVariants: htmlVariants.length,
    examQuestions: exercisesReading.items.length,
    appendixSections: textSections.filter((section) => section.sectionKind === "appendix").length,
    unitsPresent: [...new Set(textSections.map((section) => section.unitNumber).filter(Boolean))]
      .length,
  },
  regressions: {
    unit1Culture: textSections.some(
      (section) => section.unitNumber === 1 && section.sectionHeading.includes("문화 이해하기"),
    ),
    unit3HasTableNote: textsMarkdown.includes("таблица"),
    unit7Blank: textsMarkdown.includes("자전거를 (㉠)공원에"),
    unit9FlowerAndMarkers:
      textsMarkdown.includes("이 꽃을") &&
      textsMarkdown.includes("(㉠)") &&
      textsMarkdown.includes("(㉡)"),
    unit10Present: textSections.some((section) => section.unitNumber === 10),
    unit11BusyLine: textsMarkdown.includes("아, 바쁘겠어요."),
    unit13Straight: textsMarkdown.includes("앞으로 쭉 가면"),
    unit14Present: textSections.some((section) => section.unitNumber === 14),
    unit15Present: textSections.some((section) => section.unitNumber === 15),
    appendixPresent: textSections.some((section) => section.sectionKind === "appendix"),
  },
  variants: htmlVariants.map((variant) => ({
    index: variant.index,
    label: variant.label,
    questionCount: variant.questions.length,
    suggestedUnitLogicalId: `unit.u${String(suggestedUnitForVariant(variant.index - 1)).padStart(2, "0")}`,
  })),
};

const units = JSON.parse(readFileSync(path.join(CONTENT_DIR, "units.json"), "utf8")) as {
  items: Array<{ logicalId: string; contentVersion: string; sourceRefs: unknown[] }>;
};
const grammarTopics = JSON.parse(
  readFileSync(path.join(CONTENT_DIR, "grammar-topics.json"), "utf8"),
) as {
  items: Array<{ logicalId: string; contentVersion: string; sourceRefs: unknown[] }>;
};
// Preserve dictionary provenance notes from existing file when present.
const existingProvenance = JSON.parse(
  readFileSync(path.join(CONTENT_DIR, "provenance.json"), "utf8"),
) as {
  items: Array<{
    logicalId: string;
    subjectLogicalId: string;
    contentVersion: string;
    sourceRefs: unknown[];
    notes?: string;
  }>;
};
const dictionaryProvenance = existingProvenance.items.filter((row) =>
  row.subjectLogicalId.startsWith("dict."),
);

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
    ...dictionaryProvenance,
    ...readingPassages.items.map((passage) => ({
      logicalId: `prov.${passage.logicalId}`,
      subjectLogicalId: passage.logicalId,
      contentVersion: passage.contentVersion,
      sourceRefs: passage.sourceRefs,
      notes: passage.logicalId.startsWith("passage.exam.")
        ? "Draft exam-bank passage extracted from derived reading HTML."
        : "Imported from CURRICULUM_TEXTS.md.",
    })),
    ...exercisesReading.items.map((exercise) => ({
      logicalId: `prov.${exercise.logicalId}`,
      subjectLogicalId: exercise.logicalId,
      contentVersion: exercise.contentVersion,
      sourceRefs: exercise.sourceRefs,
      notes: "Draft reading exercise from derived HTML; answers kept in authoring JSON only.",
    })),
  ],
};

writeJson("reading-passages.json", readingPassages);
writeJson("exercises-reading.json", exercisesReading);
writeJson("reading-reconciliation.json", report);
writeJson("provenance.json", provenance);
formatWithPrettier([
  "reading-passages.json",
  "exercises-reading.json",
  "reading-reconciliation.json",
  "provenance.json",
]);

console.log(
  [
    `Wrote reading corpus: textbookPassages=${readingPassagesFromTexts.length}`,
    `examPassages=${examPassages.length}`,
    `exercises=${exercisesReading.items.length}`,
    `appendix=${report.counts.appendixSections}`,
    `provenance=${provenance.items.length}`,
  ].join(", "),
);
