import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import type { ExerciseRecord } from "./schemas";

const ROOT = process.cwd();
const CONTENT_DIR = path.join(ROOT, "content", "phase-2");
const QUESTIONS_PER_UNIT = 3;

type Passage = {
  logicalId: string;
  contentVersion: string;
  status: "draft" | "needs_review" | "reviewed" | "approved" | "archived";
  sourceRefs: ExerciseRecord["sourceRefs"];
  review?: { reviewedAt?: string; note?: string };
  unitLogicalId: string;
  title: { ko: string; ru: string };
  bodyKo: string;
  bodyRu: string | null;
};

type ProvenanceItem = {
  logicalId: string;
  subjectLogicalId: string;
  contentVersion: string;
  sourceRefs: unknown[];
  notes?: string;
};

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
    throw new Error(result.stderr || result.stdout || "prettier failed on reading bank outputs");
  }
}

function hasBlankMarkers(bodyKo: string): boolean {
  return /[㉠㉡㉢㉣]/.test(bodyKo);
}

function scorePassage(passage: Passage): number {
  if (passage.logicalId.includes(".exam.") || passage.logicalId.includes("appendix")) {
    return -1000;
  }
  let score = Math.min(passage.bodyKo.length, 500) / 50;
  if (passage.title.ko.includes("읽고")) score += 100;
  if (passage.title.ko.includes("글")) score += 40;
  if (passage.title.ko.includes("안내")) score += 20;
  if (hasBlankMarkers(passage.bodyKo)) score -= 15;
  return score;
}

function selectCanonicalPassages(passages: readonly Passage[]): Map<string, Passage> {
  const selected = new Map<string, Passage>();
  const byUnit = new Map<string, Passage[]>();
  for (const passage of passages) {
    const list = byUnit.get(passage.unitLogicalId) ?? [];
    list.push(passage);
    byUnit.set(passage.unitLogicalId, list);
  }

  for (const [unitLogicalId, unitPassages] of byUnit) {
    const ranked = [...unitPassages].sort((left, right) => {
      const scoreDiff = scorePassage(right) - scorePassage(left);
      if (scoreDiff !== 0) return scoreDiff;
      return left.logicalId.localeCompare(right.logicalId);
    });
    const best = ranked[0];
    if (!best || scorePassage(best) < 0) {
      throw new Error(`No canonical textbook passage for ${unitLogicalId}`);
    }
    selected.set(unitLogicalId, best);
  }

  if (selected.size !== 16) {
    throw new Error(`Expected 16 canonical passages, got ${selected.size}`);
  }
  return selected;
}

function contentLines(bodyKo: string): string[] {
  return bodyKo
    .split(/\n+/u)
    .map((line) => line.replace(/^[^:\n]{1,20}:\s*/u, "").trim())
    .filter((line) => line.length >= 8 && !hasBlankMarkers(line));
}

function koreanLexemes(text: string): string[] {
  return [...text.matchAll(/[가-힣]{2,}/gu)].map((match) => match[0]!);
}

function uniquePreserve<T>(items: readonly T[]): T[] {
  const seen = new Set<string>();
  const result: T[] = [];
  for (const item of items) {
    const key = String(item);
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(item);
  }
  return result;
}

function buildMainIdeaExercise(
  passage: Passage,
  distractorTitles: readonly string[],
): ExerciseRecord {
  const unitPad = passage.unitLogicalId.replace(/^unit\./, "");
  const snippet = contentLines(passage.bodyKo)[0] ?? passage.bodyKo.slice(0, 40);
  const options = uniquePreserve([passage.title.ko, ...distractorTitles])
    .slice(0, 4)
    .map((title, index) => ({
      id: `opt${index + 1}`,
      label: { ko: title, ru: title },
    }));
  while (options.length < 4) {
    options.push({
      id: `opt${options.length + 1}`,
      label: { ko: `주제 ${options.length + 1}`, ru: `주제 ${options.length + 1}` },
    });
  }
  const correctOptionId =
    options.find((option) => option.label.ko === passage.title.ko)?.id ?? "opt1";

  return {
    logicalId: `exercise.reading.bank.${unitPad}.q01`,
    contentVersion: passage.contentVersion,
    status: "draft",
    sourceRefs: passage.sourceRefs,
    skill: "reading",
    exerciseType: "single-choice",
    unitLogicalId: passage.unitLogicalId,
    grammarTopicLogicalId: null,
    readingPassageLogicalId: passage.logicalId,
    dictionaryEntryLogicalIds: [],
    prompt: {
      ko: "이 글의 중심 내용은 무엇입니까? 알맞은 것을 고르십시오.",
      ru: "О чём этот текст? Выберите подходящий вариант.",
    },
    explanation: {
      ko: `중심 내용은 제목/주제에 가깝습니다. 관련 부분: «${snippet}»`,
      ru: `Черновой вопрос на главную мысль. Фрагмент: «${snippet}»`,
    },
    difficulty: "intro",
    options,
    pairs: [],
    correctOptionId,
    acceptedAnswers: [],
  };
}

function buildDetailExercise(passage: Passage, distractorLines: readonly string[]): ExerciseRecord {
  const unitPad = passage.unitLogicalId.replace(/^unit\./, "");
  const lines = contentLines(passage.bodyKo);
  const correct = lines[0] ?? passage.bodyKo.replace(/\s+/gu, " ").slice(0, 48);
  const distractors = distractorLines
    .filter((line) => line !== correct && !passage.bodyKo.includes(line))
    .slice(0, 3);
  const optionLabels = uniquePreserve([correct, ...distractors]).slice(0, 4);
  while (optionLabels.length < 4) {
    optionLabels.push(`다른 내용 ${optionLabels.length + 1}`);
  }
  const options = optionLabels.map((label, index) => ({
    id: `opt${index + 1}`,
    label: { ko: label, ru: label },
  }));

  return {
    logicalId: `exercise.reading.bank.${unitPad}.q02`,
    contentVersion: passage.contentVersion,
    status: "draft",
    sourceRefs: passage.sourceRefs,
    skill: "reading",
    exerciseType: "single-choice",
    unitLogicalId: passage.unitLogicalId,
    grammarTopicLogicalId: null,
    readingPassageLogicalId: passage.logicalId,
    dictionaryEntryLogicalIds: [],
    prompt: {
      ko: "다음 중 글의 내용과 같은 것을 고르십시오.",
      ru: "Выберите утверждение, которое соответствует тексту.",
    },
    explanation: {
      ko: `정답은 글에 있는 내용입니다: «${correct}»`,
      ru: `Черновой вопрос на соответствие. Фрагмент: «${correct}»`,
    },
    difficulty: "practice",
    options,
    pairs: [],
    correctOptionId: "opt1",
    acceptedAnswers: [],
  };
}

function buildFillExercise(passage: Passage, distractorLexemes: readonly string[]): ExerciseRecord {
  const unitPad = passage.unitLogicalId.replace(/^unit\./, "");
  const lines = contentLines(passage.bodyKo);
  let templateLine =
    lines.find((line) => koreanLexemes(line).length >= 2) ?? lines[0] ?? passage.bodyKo;
  const lexemes = koreanLexemes(templateLine).filter((lexeme) => lexeme.length >= 2);
  const answer = lexemes.sort((a, b) => b.length - a.length)[0] ?? passage.title.ko.slice(0, 2);
  if (!templateLine.includes(answer)) {
    templateLine = `${answer} ${templateLine}`.trim();
  }
  const blanked = templateLine.replace(answer, "____");
  const distractors = distractorLexemes
    .filter((lexeme) => lexeme !== answer && !answer.includes(lexeme))
    .slice(0, 3);
  const optionLabels = uniquePreserve([answer, ...distractors]).slice(0, 4);
  while (optionLabels.length < 4) {
    optionLabels.push(`단어${optionLabels.length + 1}`);
  }

  return {
    logicalId: `exercise.reading.bank.${unitPad}.q03`,
    contentVersion: passage.contentVersion,
    status: "draft",
    sourceRefs: passage.sourceRefs,
    skill: "reading",
    exerciseType: "single-choice",
    unitLogicalId: passage.unitLogicalId,
    grammarTopicLogicalId: null,
    readingPassageLogicalId: passage.logicalId,
    dictionaryEntryLogicalIds: [],
    prompt: {
      ko: `빈칸에 들어갈 말로 알맞은 것을 고르십시오.\n${blanked}`,
      ru: `Выберите слово для пропуска.\n${blanked}`,
    },
    explanation: {
      ko: `빈칸의 말은 글의 이 부분에서 옵니다: «${templateLine}»`,
      ru: `Черновой вопрос на заполнение. Фрагмент: «${templateLine}»`,
    },
    difficulty: "practice",
    options: optionLabels.map((label, index) => ({
      id: `opt${index + 1}`,
      label: { ko: label, ru: label },
    })),
    pairs: [],
    correctOptionId: "opt1",
    acceptedAnswers: [],
  };
}

const passagesFile = JSON.parse(
  readFileSync(path.join(CONTENT_DIR, "reading-passages.json"), "utf8"),
) as { schemaVersion: string; items: Passage[] };
const exercisesFile = JSON.parse(
  readFileSync(path.join(CONTENT_DIR, "exercises-reading.json"), "utf8"),
) as { schemaVersion: string; items: ExerciseRecord[] };

const selected = selectCanonicalPassages(passagesFile.items);
const selectedIds = new Set([...selected.values()].map((passage) => passage.logicalId));
const selectedList = [...selected.values()].sort((a, b) =>
  a.unitLogicalId.localeCompare(b.unitLogicalId),
);

const updatedPassages: Passage[] = passagesFile.items.map((passage) => {
  if (!selectedIds.has(passage.logicalId)) {
    return passage;
  }
  const marked = hasBlankMarkers(passage.bodyKo);
  return {
    ...passage,
    status: marked ? "needs_review" : "reviewed",
    review: {
      reviewedAt: "2026-08-10T00:00:00.000Z",
      note: marked
        ? "Selected as unit canonical reading passage for F2-I17; blank markers require language review."
        : "Selected as unit canonical reading passage for F2-I17 structural bank.",
    },
    bodyRu: passage.bodyRu, // never invent translation
  };
});

const allTitles = selectedList.map((passage) => passage.title.ko);
const allDetailLines = selectedList.flatMap((passage) => contentLines(passage.bodyKo));
const allLexemes = selectedList.flatMap((passage) => koreanLexemes(passage.bodyKo));

const bankExercises: ExerciseRecord[] = [];
for (const passage of selectedList) {
  const otherTitles = allTitles.filter((title) => title !== passage.title.ko);
  const otherLines = allDetailLines.filter((line) => !passage.bodyKo.includes(line));
  const otherLexemes = allLexemes.filter((lexeme) => !passage.bodyKo.includes(lexeme));
  bankExercises.push(buildMainIdeaExercise(passage, otherTitles));
  bankExercises.push(buildDetailExercise(passage, otherLines));
  bankExercises.push(buildFillExercise(passage, otherLexemes));
}

if (bankExercises.length !== 16 * QUESTIONS_PER_UNIT) {
  throw new Error(
    `Expected ${16 * QUESTIONS_PER_UNIT} bank exercises, got ${bankExercises.length}`,
  );
}

const examExercises = exercisesFile.items.filter((exercise) =>
  exercise.logicalId.startsWith("exercise.reading.exam."),
);
const exercisesReading = {
  schemaVersion: "phase-2.v1",
  items: [...examExercises, ...bankExercises],
};

const selectionReport = {
  schemaVersion: "phase-2.reading-bank.v1",
  generatedAt: "2026-08-10T00:00:00.000Z",
  questionsPerUnit: QUESTIONS_PER_UNIT,
  selected: selectedList.map((passage) => ({
    unitLogicalId: passage.unitLogicalId,
    passageLogicalId: passage.logicalId,
    titleKo: passage.title.ko,
    status: hasBlankMarkers(passage.bodyKo) ? "needs_review" : "reviewed",
    hasBlankMarkers: hasBlankMarkers(passage.bodyKo),
  })),
};

const existingProvenance = JSON.parse(
  readFileSync(path.join(CONTENT_DIR, "provenance.json"), "utf8"),
) as { schemaVersion: string; items: ProvenanceItem[] };

const preserved = existingProvenance.items.filter(
  (row) =>
    !row.subjectLogicalId.startsWith("exercise.reading.") &&
    !row.subjectLogicalId.startsWith("passage."),
);

const passageProvenance: ProvenanceItem[] = updatedPassages.map((passage) => ({
  logicalId: `prov.${passage.logicalId}`,
  subjectLogicalId: passage.logicalId,
  contentVersion: passage.contentVersion,
  sourceRefs: passage.sourceRefs,
  notes: selectedIds.has(passage.logicalId)
    ? passage.logicalId.startsWith("passage.exam.")
      ? "Draft exam-bank passage extracted from derived reading HTML."
      : hasBlankMarkers(passage.bodyKo)
        ? "Canonical unit reading passage for F2-I17; blank markers kept for review."
        : "Canonical unit reading passage for F2-I17 structural bank."
    : passage.logicalId.startsWith("passage.exam.")
      ? "Draft exam-bank passage extracted from derived reading HTML."
      : "Imported from CURRICULUM_TEXTS.md.",
}));

const examProvenance = examExercises.map((exercise) => ({
  logicalId: `prov.${exercise.logicalId}`,
  subjectLogicalId: exercise.logicalId,
  contentVersion: exercise.contentVersion,
  sourceRefs: exercise.sourceRefs,
  notes: "Draft reading exercise from derived HTML; answers kept in authoring JSON only.",
}));

const bankProvenance = bankExercises.map((exercise) => ({
  logicalId: `prov.${exercise.logicalId}`,
  subjectLogicalId: exercise.logicalId,
  contentVersion: exercise.contentVersion,
  sourceRefs: exercise.sourceRefs,
  notes: "manual-derived draft reading bank question; explanation cites a passage fragment.",
}));

writeJson("reading-passages.json", {
  schemaVersion: "phase-2.v1",
  items: updatedPassages,
});
writeJson("exercises-reading.json", exercisesReading);
writeJson("reading-bank-selection.json", selectionReport);
writeJson("provenance.json", {
  schemaVersion: "phase-2.v1",
  items: [...preserved, ...passageProvenance, ...examProvenance, ...bankProvenance],
});

formatWithPrettier([
  "reading-passages.json",
  "exercises-reading.json",
  "reading-bank-selection.json",
  "provenance.json",
]);

console.log(
  [
    `Wrote reading bank: canonicalPassages=${selectedList.length}`,
    `bankExercises=${bankExercises.length}`,
    `examExercises=${examExercises.length}`,
    `totalReadingExercises=${exercisesReading.items.length}`,
  ].join(", "),
);
