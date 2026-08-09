import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import type { ExerciseRecord, GrammarTopicRecord } from "./schemas";

const ROOT = process.cwd();
const CONTENT_DIR = path.join(ROOT, "content", "phase-2");

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
    throw new Error(
      result.stderr || result.stdout || "prettier failed on grammar exercise outputs",
    );
  }
}

function stripUsageMarkers(patternKo: string): string {
  return patternKo.replace(/[①②③④⑤⑥⑦⑧⑨⑩]/gu, "").trim();
}

function pickDistractors(
  topic: GrammarTopicRecord,
  unitTopics: readonly GrammarTopicRecord[],
): GrammarTopicRecord[] {
  const sameUnit = unitTopics.filter((candidate) => candidate.logicalId !== topic.logicalId);
  if (sameUnit.length >= 3) {
    return sameUnit.slice(0, 3);
  }

  // Units with fewer than 4 topics borrow from adjacent units (same category).
  const borrowed: GrammarTopicRecord[] = [];
  for (const candidate of unitTopics) {
    if (candidate.logicalId === topic.logicalId) continue;
    borrowed.push(candidate);
  }
  return borrowed.slice(0, Math.max(1, borrowed.length));
}

function buildRecognitionExercise(
  topic: GrammarTopicRecord,
  unitTopics: readonly GrammarTopicRecord[],
): ExerciseRecord {
  const distractors = pickDistractors(topic, unitTopics);
  const optionTopics = [topic, ...distractors].slice(0, 4);
  const options = optionTopics.map((optionTopic, index) => ({
    id: `opt${index + 1}`,
    label: {
      ko: optionTopic.patternKo,
      ru: optionTopic.patternKo,
    },
  }));
  const correctOptionId = "opt1";

  const summaryRu = topic.summary?.ru ?? topic.title.ru;

  return {
    logicalId: `exercise.grammar.${topic.logicalId.replace(/^grammar\./, "")}.recognition`,
    contentVersion: "1.0.0",
    status: "draft",
    sourceRefs: topic.sourceRefs,
    skill: "grammar",
    exerciseType: "single-choice",
    unitLogicalId: topic.unitLogicalId,
    grammarTopicLogicalId: topic.logicalId,
    readingPassageLogicalId: null,
    dictionaryEntryLogicalIds: [],
    prompt: {
      ko: "알맞은 문법 패턴을 고르십시오.",
      ru: `Выберите корейский паттерн для правила: «${summaryRu}»`,
    },
    explanation: {
      ko: "Draft grammar recognition from curriculum topic; not language-approved.",
      ru: "Черновое упражнение на распознавание паттерна из каталога; язык не утверждён.",
    },
    difficulty: "intro",
    options,
    pairs: [],
    correctOptionId,
    acceptedAnswers: [],
  };
}

function buildApplicationExercise(topic: GrammarTopicRecord): ExerciseRecord {
  const summaryRu = topic.summary?.ru ?? topic.title.ru;
  const stripped = stripUsageMarkers(topic.patternKo);
  const acceptedAnswers = [topic.patternKo];
  if (stripped !== topic.patternKo) {
    acceptedAnswers.push(stripped);
  }

  return {
    logicalId: `exercise.grammar.${topic.logicalId.replace(/^grammar\./, "")}.application`,
    contentVersion: "1.0.0",
    status: "draft",
    sourceRefs: topic.sourceRefs,
    skill: "grammar",
    exerciseType: "free-response",
    unitLogicalId: topic.unitLogicalId,
    grammarTopicLogicalId: topic.logicalId,
    readingPassageLogicalId: null,
    dictionaryEntryLogicalIds: [],
    prompt: {
      ko: "설명에 맞는 문법 패턴을 쓰십시오.",
      ru: `Напишите корейский паттерн для правила: «${summaryRu}»`,
    },
    explanation: {
      ko: "Draft grammar application from curriculum topic; not language-approved.",
      ru: "Черновое упражнение на применение паттерна из каталога; язык не утверждён.",
    },
    difficulty: "practice",
    options: [],
    pairs: [],
    correctOptionId: null,
    acceptedAnswers,
  };
}

const grammarTopics = JSON.parse(
  readFileSync(path.join(CONTENT_DIR, "grammar-topics.json"), "utf8"),
) as { schemaVersion: string; items: GrammarTopicRecord[] };

const byUnit = new Map<string, GrammarTopicRecord[]>();
for (const topic of grammarTopics.items) {
  const list = byUnit.get(topic.unitLogicalId) ?? [];
  list.push(topic);
  byUnit.set(topic.unitLogicalId, list);
}

const exercises: ExerciseRecord[] = [];
for (const topic of grammarTopics.items) {
  const unitTopics = byUnit.get(topic.unitLogicalId) ?? [];
  exercises.push(buildRecognitionExercise(topic, unitTopics));
  exercises.push(buildApplicationExercise(topic));
}

const exercisesGrammar = {
  schemaVersion: "phase-2.v1",
  items: exercises,
};

const existingProvenance = JSON.parse(
  readFileSync(path.join(CONTENT_DIR, "provenance.json"), "utf8"),
) as { schemaVersion: string; items: ProvenanceItem[] };

const preserved = existingProvenance.items.filter(
  (row) => !row.subjectLogicalId.startsWith("exercise.grammar."),
);

const grammarExerciseProvenance: ProvenanceItem[] = exercises.map((exercise) => ({
  logicalId: `prov.${exercise.logicalId}`,
  subjectLogicalId: exercise.logicalId,
  contentVersion: exercise.contentVersion,
  sourceRefs: exercise.sourceRefs,
  notes:
    "manual-derived draft grammar exercise from curriculum topic pattern/summary; not language-approved.",
}));

const provenance = {
  schemaVersion: "phase-2.v1",
  items: [...preserved, ...grammarExerciseProvenance],
};

writeJson("exercises-grammar.json", exercisesGrammar);
writeJson("provenance.json", provenance);
formatWithPrettier(["exercises-grammar.json", "provenance.json"]);

console.log(
  `Wrote grammar exercises: count=${exercises.length}, topics=${grammarTopics.items.length}, provenance=${provenance.items.length}`,
);
