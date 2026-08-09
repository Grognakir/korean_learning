import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import type { DictionaryEntryRecord, DictionaryUnitLinkRecord, ExerciseRecord } from "./schemas";

const ROOT = process.cwd();
const CONTENT_DIR = path.join(ROOT, "content", "phase-2");
const SENSES_PER_UNIT = 12;
const EXERCISES_PER_UNIT = 4;

const UNIT_CATEGORY_PRIORITY: Readonly<Record<string, readonly string[]>> = {
  "unit.u01": ["pronouns", "question-words", "misc"],
  "unit.u02": ["household-objects", "spatial", "study"],
  "unit.u03": ["study", "professions", "misc"],
  "unit.u04": ["dates", "temporal-adverbs", "household-chores", "misc"],
  "unit.u05": ["times-of-day", "verbs", "manner-adverbs"],
  "unit.u06": ["sports", "verbs", "misc"],
  "unit.u07": ["adjectives", "temporal-adverbs", "misc"],
  "unit.u08": ["verbs", "temporal-adverbs", "misc"],
  "unit.u09": ["clothing", "counters", "numerals", "misc"],
  "unit.u10": ["food", "vegetables", "fruits"],
  "unit.u11": ["electronics", "misc", "verbs"],
  "unit.u12": ["conjunctions", "manner-adverbs", "misc"],
  "unit.u13": ["places", "spatial", "verbs"],
  "unit.u14": ["places", "professions", "misc"],
  "unit.u15": ["body-parts", "adjectives", "misc"],
  "unit.u16": ["family", "misc", "pronouns"],
};

const EXCLUDED_CATEGORIES = new Set([
  "business",
  "grammar-terms",
  "particles",
  "connective-endings",
]);

type ReconciliationRow = {
  logicalId: string | null;
  categoryKey: string;
  classification: string;
};

type ProvenanceItem = {
  logicalId: string;
  subjectLogicalId: string;
  contentVersion: string;
  sourceRefs: unknown[];
  notes?: string;
};

type EntryWithMeta = DictionaryEntryRecord & {
  categoryKey: string;
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
    throw new Error(result.stderr || result.stdout || "prettier failed on vocabulary outputs");
  }
}

function sourceRef(locatorValue: string) {
  return {
    sourceId: "src.curriculum-vocabulary" as const,
    locator: { kind: "section" as const, value: locatorValue },
    confidence: "high" as const,
  };
}

function antonymLemmasFromNotes(notes: string | undefined): Set<string> {
  const found = new Set<string>();
  if (!notes) return found;
  for (const match of notes.matchAll(/антоним(?:ы)?:\s*([가-힣/]+)/giu)) {
    for (const lemma of match[1]!.split("/")) {
      const trimmed = lemma.trim();
      if (trimmed) found.add(trimmed);
    }
  }
  return found;
}

function pickSamePosDistractors(
  target: EntryWithMeta,
  pool: readonly EntryWithMeta[],
  count: number,
): EntryWithMeta[] {
  const antonyms = antonymLemmasFromNotes(
    // notes live only in provenance historically; keep empty-safe
    undefined,
  );
  const samePos = pool.filter(
    (candidate) =>
      candidate.logicalId !== target.logicalId &&
      candidate.pos === target.pos &&
      candidate.gloss.ru !== target.gloss.ru &&
      candidate.lemma !== target.lemma &&
      !antonyms.has(candidate.lemma),
  );
  if (samePos.length >= count) {
    return samePos.slice(0, count);
  }
  const fallback = pool.filter(
    (candidate) =>
      candidate.logicalId !== target.logicalId &&
      candidate.gloss.ru !== target.gloss.ru &&
      candidate.lemma !== target.lemma,
  );
  return [...samePos, ...fallback.filter((item) => !samePos.includes(item))].slice(0, count);
}

function selectUnitSenses(
  unitLogicalId: string,
  byCategory: Map<string, EntryWithMeta[]>,
  claimed: Set<string>,
): EntryWithMeta[] {
  const priorities = UNIT_CATEGORY_PRIORITY[unitLogicalId] ?? ["misc"];
  const selected: EntryWithMeta[] = [];
  const selectedLemmas = new Set<string>();

  for (const category of priorities) {
    const candidates = (byCategory.get(category) ?? []).filter(
      (entry) => !claimed.has(entry.logicalId) && !EXCLUDED_CATEGORIES.has(category),
    );
    for (const entry of candidates) {
      if (selected.length >= SENSES_PER_UNIT) break;
      if (selectedLemmas.has(entry.lemma)) continue;
      selected.push(entry);
      selectedLemmas.add(entry.lemma);
      claimed.add(entry.logicalId);
    }
    if (selected.length >= SENSES_PER_UNIT) break;
  }

  if (selected.length < SENSES_PER_UNIT) {
    const filler = [...byCategory.values()]
      .flat()
      .filter(
        (entry) =>
          !claimed.has(entry.logicalId) &&
          !EXCLUDED_CATEGORIES.has(entry.categoryKey) &&
          !selectedLemmas.has(entry.lemma),
      );
    for (const entry of filler) {
      if (selected.length >= SENSES_PER_UNIT) break;
      selected.push(entry);
      selectedLemmas.add(entry.lemma);
      claimed.add(entry.logicalId);
    }
  }

  if (selected.length < SENSES_PER_UNIT) {
    throw new Error(`Unit ${unitLogicalId} could not gather ${SENSES_PER_UNIT} senses`);
  }

  return selected.slice(0, SENSES_PER_UNIT);
}

function buildMeaningChoice(
  unitLogicalId: string,
  target: EntryWithMeta,
  pool: EntryWithMeta[],
): ExerciseRecord {
  const distractors = pickSamePosDistractors(target, pool, 3);
  const optionEntries = [target, ...distractors];
  const homonymContext =
    pool.filter((entry) => entry.lemma === target.lemma).length > 1
      ? ` (смысл: ${target.gloss.ru})`
      : "";

  return {
    logicalId: `exercise.vocabulary.${unitLogicalId.replace(/^unit\./, "")}.${target.senseKey}.ko-ru`,
    contentVersion: "1.0.0",
    status: "draft",
    sourceRefs: target.sourceRefs,
    skill: "vocabulary",
    exerciseType: "meaning-choice",
    unitLogicalId,
    grammarTopicLogicalId: null,
    readingPassageLogicalId: null,
    dictionaryEntryLogicalIds: [target.logicalId],
    prompt: {
      ko: target.lemma,
      ru: `Выберите значение слова${homonymContext}.`,
    },
    explanation: {
      ko: "Draft vocabulary meaning-choice; not language-approved.",
      ru: "Черновой выбор значения слова; язык не утверждён.",
    },
    difficulty: "intro",
    options: optionEntries.map((entry, index) => ({
      id: `opt${index + 1}`,
      label: { ko: entry.gloss.ru, ru: entry.gloss.ru },
    })),
    pairs: [],
    correctOptionId: "opt1",
    acceptedAnswers: [],
  };
}

function buildReverseChoice(
  unitLogicalId: string,
  target: EntryWithMeta,
  pool: EntryWithMeta[],
): ExerciseRecord {
  const distractors = pickSamePosDistractors(target, pool, 3);
  const optionEntries = [target, ...distractors];

  return {
    logicalId: `exercise.vocabulary.${unitLogicalId.replace(/^unit\./, "")}.${target.senseKey}.ru-ko`,
    contentVersion: "1.0.0",
    status: "draft",
    sourceRefs: target.sourceRefs,
    skill: "vocabulary",
    exerciseType: "meaning-choice",
    unitLogicalId,
    grammarTopicLogicalId: null,
    readingPassageLogicalId: null,
    dictionaryEntryLogicalIds: [target.logicalId],
    prompt: {
      ko: "알맞은 한국어 단어를 고르십시오.",
      ru: `Выберите корейское слово для значения: «${target.gloss.ru}».`,
    },
    explanation: {
      ko: "Draft vocabulary reverse meaning-choice; not language-approved.",
      ru: "Черновой выбор корейского слова по переводу; язык не утверждён.",
    },
    difficulty: "practice",
    options: optionEntries.map((entry, index) => ({
      id: `opt${index + 1}`,
      label: { ko: entry.lemma, ru: entry.lemma },
    })),
    pairs: [],
    correctOptionId: "opt1",
    acceptedAnswers: [],
  };
}

function buildFreeResponse(unitLogicalId: string, target: EntryWithMeta): ExerciseRecord {
  return {
    logicalId: `exercise.vocabulary.${unitLogicalId.replace(/^unit\./, "")}.${target.senseKey}.produce`,
    contentVersion: "1.0.0",
    status: "draft",
    sourceRefs: target.sourceRefs,
    skill: "vocabulary",
    exerciseType: "free-response",
    unitLogicalId,
    grammarTopicLogicalId: null,
    readingPassageLogicalId: null,
    dictionaryEntryLogicalIds: [target.logicalId],
    prompt: {
      ko: "한국어로 쓰십시오.",
      ru: `Напишите по-корейски: «${target.gloss.ru}».`,
    },
    explanation: {
      ko: "Draft vocabulary free-response; transliteration is not accepted.",
      ru: "Черновой ввод слова; транслитерация не принимается.",
    },
    difficulty: "practice",
    options: [],
    pairs: [],
    correctOptionId: null,
    acceptedAnswers: [target.lemma],
  };
}

function buildMatching(unitLogicalId: string, targets: EntryWithMeta[]): ExerciseRecord {
  const pairs = targets.slice(0, 4).map((entry, index) => ({
    id: `pair${index + 1}`,
    left: { ko: entry.lemma, ru: entry.lemma },
    right: { ko: entry.gloss.ru, ru: entry.gloss.ru },
  }));

  return {
    logicalId: `exercise.vocabulary.${unitLogicalId.replace(/^unit\./, "")}.matching.v01`,
    contentVersion: "1.0.0",
    status: "draft",
    sourceRefs: [sourceRef(`${unitLogicalId}.matching`)],
    skill: "vocabulary",
    exerciseType: "matching-translation",
    unitLogicalId,
    grammarTopicLogicalId: null,
    readingPassageLogicalId: null,
    dictionaryEntryLogicalIds: targets.slice(0, 4).map((entry) => entry.logicalId),
    prompt: {
      ko: "단어를 뜻과 연결하십시오.",
      ru: "Сопоставьте корейские слова и значения.",
    },
    explanation: {
      ko: "Draft vocabulary matching; not language-approved.",
      ru: "Черновое сопоставление словаря; язык не утверждён.",
    },
    difficulty: "intro",
    options: [],
    pairs,
    correctOptionId: null,
    acceptedAnswers: [],
  };
}

const units = JSON.parse(readFileSync(path.join(CONTENT_DIR, "units.json"), "utf8")) as {
  items: Array<{ logicalId: string }>;
};
const dictionaryFile = JSON.parse(
  readFileSync(path.join(CONTENT_DIR, "dictionary-entries.json"), "utf8"),
) as { schemaVersion: string; items: DictionaryEntryRecord[] };
const reconciliation = JSON.parse(
  readFileSync(path.join(CONTENT_DIR, "dictionary-reconciliation.json"), "utf8"),
) as { rows: ReconciliationRow[] };

const categoryByLogical = new Map(
  reconciliation.rows
    .filter((row) => row.classification === "canonical_sense" && row.logicalId)
    .map((row) => [row.logicalId!, row.categoryKey] as const),
);

const entriesWithMeta: EntryWithMeta[] = dictionaryFile.items.map((entry) => ({
  ...entry,
  categoryKey: categoryByLogical.get(entry.logicalId) ?? "misc",
}));

if (entriesWithMeta.some((entry) => entry.categoryKey === "добавлено")) {
  throw new Error("Forbidden category 'добавлено' present among dictionary entries");
}

const byCategory = new Map<string, EntryWithMeta[]>();
for (const entry of entriesWithMeta) {
  if (EXCLUDED_CATEGORIES.has(entry.categoryKey)) continue;
  const list = byCategory.get(entry.categoryKey) ?? [];
  list.push(entry);
  byCategory.set(entry.categoryKey, list);
}
for (const list of byCategory.values()) {
  list.sort((a, b) => a.logicalId.localeCompare(b.logicalId));
}

const claimed = new Set<string>();
const unitSelections = new Map<string, EntryWithMeta[]>();
for (const unit of units.items) {
  unitSelections.set(unit.logicalId, selectUnitSenses(unit.logicalId, byCategory, claimed));
}

const reviewedIds = new Set([...unitSelections.values()].flat().map((entry) => entry.logicalId));
const updatedEntries: DictionaryEntryRecord[] = dictionaryFile.items.map((entry) => {
  if (!reviewedIds.has(entry.logicalId)) {
    return entry;
  }
  return {
    ...entry,
    status: "reviewed",
    review: {
      reviewedAt: "2026-08-10T00:00:00.000Z",
      note: "Selected for minimal vocabulary exercise bank (F2-I16); language still draft for publication.",
    },
  };
});

const links: DictionaryUnitLinkRecord[] = [];
for (const [unitLogicalId, senses] of unitSelections) {
  senses.forEach((entry, index) => {
    links.push({
      logicalId: `dictlink.${unitLogicalId.replace(/^unit\./, "")}.${entry.logicalId
        .replace(/^dict\./, "")
        .replace(/\./g, "-")}`,
      contentVersion: "1.0.0",
      entryLogicalId: entry.logicalId,
      unitLogicalId,
      role: "primary",
      sortOrder: index,
      status: "reviewed",
      sourceRefs: [sourceRef(`${unitLogicalId}.${entry.logicalId}`)],
      review: {
        reviewedAt: "2026-08-10T00:00:00.000Z",
        note: "Primary unit link for minimal vocabulary bank.",
      },
    });
  });
}

const exercises: ExerciseRecord[] = [];
for (const [unitLogicalId, senses] of unitSelections) {
  const [a, b, c] = senses;
  exercises.push(buildMeaningChoice(unitLogicalId, a!, senses));
  exercises.push(buildReverseChoice(unitLogicalId, b!, senses));
  exercises.push(buildFreeResponse(unitLogicalId, c!));
  exercises.push(buildMatching(unitLogicalId, senses.slice(3, 7)));
  if (
    exercises.filter((item) => item.unitLogicalId === unitLogicalId).length !== EXERCISES_PER_UNIT
  ) {
    throw new Error(`Expected ${EXERCISES_PER_UNIT} exercises for ${unitLogicalId}`);
  }
}

const existingProvenance = JSON.parse(
  readFileSync(path.join(CONTENT_DIR, "provenance.json"), "utf8"),
) as { schemaVersion: string; items: ProvenanceItem[] };

const preserved = existingProvenance.items.filter(
  (row) =>
    !row.subjectLogicalId.startsWith("exercise.vocabulary.") &&
    !row.subjectLogicalId.startsWith("dict."),
);

const dictionaryProvenance: ProvenanceItem[] = updatedEntries.map((entry) => ({
  logicalId: `prov.${entry.logicalId}`,
  subjectLogicalId: entry.logicalId,
  contentVersion: entry.contentVersion,
  sourceRefs: entry.sourceRefs,
  notes: reviewedIds.has(entry.logicalId)
    ? "Reviewed for minimal vocabulary bank selection; not published/approved."
    : "Draft sense from curriculum vocabulary import.",
}));

const exerciseProvenance: ProvenanceItem[] = exercises.map((exercise) => ({
  logicalId: `prov.${exercise.logicalId}`,
  subjectLogicalId: exercise.logicalId,
  contentVersion: exercise.contentVersion,
  sourceRefs: exercise.sourceRefs,
  notes:
    "manual-derived draft vocabulary exercise; transliteration is never an accepted Korean answer.",
}));

writeJson("dictionary-entries.json", {
  schemaVersion: "phase-2.v1",
  items: updatedEntries,
});
writeJson("dictionary-unit-links.json", {
  schemaVersion: "phase-2.v1",
  items: links,
});
writeJson("exercises-vocabulary.json", {
  schemaVersion: "phase-2.v1",
  items: exercises,
});
writeJson("provenance.json", {
  schemaVersion: "phase-2.v1",
  items: [...preserved, ...dictionaryProvenance, ...exerciseProvenance],
});

formatWithPrettier([
  "dictionary-entries.json",
  "dictionary-unit-links.json",
  "exercises-vocabulary.json",
  "provenance.json",
]);

console.log(
  [
    `Wrote vocabulary bank: reviewedSenses=${reviewedIds.size}`,
    `links=${links.length}`,
    `exercises=${exercises.length}`,
    `units=${unitSelections.size}`,
  ].join(", "),
);
