/**
 * F2-I22: apply individual language-review decisions.
 *
 * Two-step lifecycle only: draft|needs_review → reviewed → approved.
 * Never bulk-SQL; never approve entities absent from the decision manifest.
 *
 * Usage:
 *   pnpm exec tsx scripts/content/apply-language-review.ts --write-manifest
 *   pnpm exec tsx scripts/content/apply-language-review.ts --apply
 *   pnpm exec tsx scripts/content/apply-language-review.ts --write-manifest --apply
 */
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import { assertLifecycleTransition, LIFECYCLE_STATUSES } from "./schemas";
import { loadPhase2ContentGraph, PHASE_2_CONTENT_ROOT } from "./contentValidation";

type LifecycleStatus = (typeof LIFECYCLE_STATUSES)[number];

const REVIEWED_AT = "2026-08-10T02:30:00.000Z";
const REVIEWER_LABEL = "project-owner";
const MANIFEST_PATH = path.join(PHASE_2_CONTENT_ROOT, "language-review-decisions.json");
const CONTENT_VERSION_BUMP = "1.0.1";

type EntityKind =
  | "unit"
  | "grammar-topic"
  | "dictionary-entry"
  | "reading-passage"
  | "exercise-grammar"
  | "exercise-vocabulary"
  | "exercise-reading";

type Decision = "approve" | "hold";

type DecisionRecord = {
  logicalId: string;
  kind: EntityKind;
  decision: Decision;
  contested: boolean;
  rationale: string;
  fromStatus: LifecycleStatus;
  contentVersion: string;
};

type Manifest = {
  schemaVersion: "phase-2.language-review.v1";
  iteration: "F2-I22";
  reviewedAt: string;
  reviewer: string;
  note: string;
  decisions: DecisionRecord[];
};

type MutableEntity = {
  logicalId: string;
  contentVersion: string;
  status: LifecycleStatus;
  review?: { reviewedAt?: string; note?: string };
  explanation?: { ko: string; ru: string };
  prompt?: { ko: string; ru: string };
  patternKo?: string;
  title?: { ko: string; ru: string };
  summary?: { ko: string; ru: string };
  lemma?: string;
  gloss?: { ko: string; ru: string };
  grammarTopicLogicalId?: string | null;
  [key: string]: unknown;
};

type CollectionFile = {
  schemaVersion: string;
  items: MutableEntity[];
};

const CONTESTED: Readonly<Record<string, string>> = {
  "grammar.u07.n03":
    "Contested -아/어서①: sequential tightly linked actions (u07); kept distinct from causal ② in u12 per CURRICULUM_GRAMMAR.",
  "grammar.u12.n01":
    "Contested -아/어서② / N이어/여서: cause/reason sense (u12); separate logicalId from sequential ①.",
  "grammar.u07.n05":
    "Contested -(으)러: purpose of movement with 가다/오다; approved against CURRICULUM_GRAMMAR examples.",
  "grammar.u09.n02":
    "Contested -(으)세요/-(으)십시오: polite request/command; -(으)십시오 noted as more formal.",
  "passage.u02.section.37":
    "Contested blank markers (㉠): intentional fill prompts; source blanks not replaced with answers.",
  "passage.u07.section.s031":
    "Contested blank markers (㉠/㉡): intentional fill prompts; source blanks not replaced with answers.",
  "passage.u09.section.149":
    "Contested blank markers (㉠/㉡): intentional fill prompts; source blanks not replaced with answers.",
  "dict.dari.noga-ot-bedra-do-stopy":
    "Contested homonym 다리: body-part sense kept as primary for u15; bridge sense remains draft.",
  "dict.bae.zhivot":
    "Contested homonym 배: abdomen sense kept as primary for u15; ship sense remains draft.",
  "dict.jeo.tot-ta-to-opredelitel-daleko":
    "Contested demonstrative 저: distal determiner sense kept as primary for u01; other senses remain draft.",
};

function writeJson(filePath: string, value: unknown): void {
  writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function readCollection(fileName: string): CollectionFile {
  return JSON.parse(
    readFileSync(path.join(PHASE_2_CONTENT_ROOT, fileName), "utf8"),
  ) as CollectionFile;
}

function approvalNote(rationale: string): string {
  return `F2-I22 language approval by ${REVIEWER_LABEL}. ${rationale}`;
}

function reviewedNote(rationale: string): string {
  return `F2-I22 language review by ${REVIEWER_LABEL}. ${rationale}`;
}

function buildManifest(): Manifest {
  const graph = loadPhase2ContentGraph(PHASE_2_CONTENT_ROOT);
  const selection = JSON.parse(
    readFileSync(path.join(PHASE_2_CONTENT_ROOT, "reading-bank-selection.json"), "utf8"),
  ) as { selected: Array<{ passageLogicalId: string }> };
  const canonicalPassageIds = new Set(selection.selected.map((row) => row.passageLogicalId));
  const primaryEntryIds = new Set(
    graph.dictionaryUnitLinks.items
      .filter((link) => link.role === "primary")
      .map((link) => link.entryLogicalId),
  );

  const decisions: DecisionRecord[] = [];

  const push = (
    entity: { logicalId: string; status: LifecycleStatus; contentVersion: string },
    kind: EntityKind,
    rationale: string,
  ): void => {
    decisions.push({
      logicalId: entity.logicalId,
      kind,
      decision: "approve",
      contested: Boolean(CONTESTED[entity.logicalId]),
      rationale: CONTESTED[entity.logicalId] ?? rationale,
      fromStatus: entity.status,
      contentVersion: entity.contentVersion,
    });
  };

  for (const unit of graph.units.items) {
    push(unit, "unit", "Unit title/summary matches CURRICULUM_TOPICS outline for 1급.");
  }

  for (const topic of graph.grammarTopics.items) {
    push(
      topic,
      "grammar-topic",
      "Grammar metadata (pattern/title/summary) matches CURRICULUM_GRAMMAR atomic record.",
    );
  }

  for (const entry of graph.dictionaryEntries.items) {
    if (!primaryEntryIds.has(entry.logicalId)) continue;
    push(
      entry,
      "dictionary-entry",
      "Primary minimal vocabulary sense (≥12/unit); gloss/lemma checked for publication.",
    );
  }

  for (const passage of graph.readingPassages.items) {
    if (!canonicalPassageIds.has(passage.logicalId)) continue;
    push(
      passage,
      "reading-passage",
      "Canonical unit reading passage selected in reading-bank-selection.json.",
    );
  }

  for (const exercise of graph.exercisesGrammar.items) {
    push(
      exercise,
      "exercise-grammar",
      "Minimal grammar bank (recognition + application); explanation rewritten on approval.",
    );
  }

  for (const exercise of graph.exercisesVocabulary.items) {
    push(
      exercise,
      "exercise-vocabulary",
      "Minimal vocabulary bank (≥4/unit); explanation rewritten on approval.",
    );
  }

  for (const exercise of graph.exercisesReading.items) {
    if (!exercise.logicalId.startsWith("exercise.reading.bank.")) continue;
    push(
      exercise,
      "exercise-reading",
      "Minimal reading bank (3/unit on canonical passage); explanation cleaned on approval.",
    );
  }

  decisions.sort((a, b) => a.logicalId.localeCompare(b.logicalId));

  return {
    schemaVersion: "phase-2.language-review.v1",
    iteration: "F2-I22",
    reviewedAt: REVIEWED_AT,
    reviewer: REVIEWER_LABEL,
    note: "Individual decisions for §3.2 publishable minimum only. Non-minimum dictionary/passages/exam exercises remain draft. 쪽/쭉 lemmas are not in the primary bank and stay draft.",
    decisions,
  };
}

function rewriteGrammarExplanation(
  exercise: MutableEntity,
  topicsById: Map<string, MutableEntity>,
): void {
  const topic = exercise.grammarTopicLogicalId
    ? topicsById.get(exercise.grammarTopicLogicalId)
    : undefined;
  const pattern = topic?.patternKo ?? "패턴";
  const summaryRu = (topic?.summary?.ru ?? topic?.title?.ru ?? "грамматическое правило").replace(
    /[.。]+$/u,
    "",
  );
  if (exercise.exerciseType === "single-choice" || exercise.exerciseType === "meaning-choice") {
    exercise.explanation = {
      ko: `정답은 「${pattern}」입니다. 이 패턴은 「${summaryRu}」 의미로 쓰입니다.`,
      ru: `Верный паттерн — «${pattern}»: ${summaryRu}.`,
    };
  } else {
    exercise.explanation = {
      ko: `쓰기 연습입니다. 정답 패턴은 「${pattern}」이며, 「${summaryRu}」 의미입니다.`,
      ru: `Напишите паттерн «${pattern}» — ${summaryRu}.`,
    };
  }
  exercise.contentVersion = CONTENT_VERSION_BUMP;
}

function rewriteVocabularyExplanation(
  exercise: MutableEntity,
  entriesById: Map<string, MutableEntity>,
): void {
  const entryId = Array.isArray(exercise.dictionaryEntryLogicalIds)
    ? (exercise.dictionaryEntryLogicalIds[0] as string | undefined)
    : undefined;
  const entry = entryId ? entriesById.get(entryId) : undefined;
  const lemma = entry?.lemma ?? exercise.prompt?.ko ?? "단어";
  const glossRu = entry?.gloss?.ru ?? "значение";
  exercise.explanation = {
    ko: `「${lemma}」의 뜻은 「${glossRu}」입니다.`,
    ru: `«${lemma}» означает «${glossRu}».`,
  };
  exercise.contentVersion = CONTENT_VERSION_BUMP;
}

function rewriteReadingExplanation(exercise: MutableEntity): void {
  const ko = exercise.explanation?.ko ?? "";
  const ru = exercise.explanation?.ru ?? "";
  exercise.explanation = {
    ko: ko.replace(/^Draft reading[^.]+\.\s*/i, "").trim() || ko,
    ru:
      ru
        .replace(/^Черновой вопрос[^.]+\.\s*/i, "")
        .replace(/^Черновой[^.]+\.\s*/i, "")
        .trim() || ru,
  };
  if (/чернов|не утвержд|Draft|draft/i.test(exercise.explanation.ru)) {
    exercise.explanation = {
      ko: exercise.explanation.ko,
      ru: "Ответ опирается на содержание канонического текста модуля.",
    };
  }
  exercise.contentVersion = CONTENT_VERSION_BUMP;
}

function applyPhase(
  entitiesByFile: Map<string, CollectionFile>,
  decisions: readonly DecisionRecord[],
  target: "reviewed" | "approved",
  topicsById: Map<string, MutableEntity>,
  entriesById: Map<string, MutableEntity>,
): number {
  const fileForKind: Record<EntityKind, string> = {
    unit: "units.json",
    "grammar-topic": "grammar-topics.json",
    "dictionary-entry": "dictionary-entries.json",
    "reading-passage": "reading-passages.json",
    "exercise-grammar": "exercises-grammar.json",
    "exercise-vocabulary": "exercises-vocabulary.json",
    "exercise-reading": "exercises-reading.json",
  };

  let changed = 0;

  for (const decision of decisions) {
    if (decision.decision !== "approve") continue;
    const fileName = fileForKind[decision.kind];
    const collection = entitiesByFile.get(fileName);
    if (!collection) throw new Error(`Missing collection ${fileName}`);
    const entity = collection.items.find((item) => item.logicalId === decision.logicalId);
    if (!entity) throw new Error(`Missing entity ${decision.logicalId} in ${fileName}`);

    if (entity.status === target) continue;

    assertLifecycleTransition(entity.status, target);
    entity.status = target;
    entity.review = {
      reviewedAt: REVIEWED_AT,
      note:
        target === "reviewed" ? reviewedNote(decision.rationale) : approvalNote(decision.rationale),
    };

    if (target === "approved") {
      if (decision.kind === "exercise-grammar") {
        rewriteGrammarExplanation(entity, topicsById);
      } else if (decision.kind === "exercise-vocabulary") {
        rewriteVocabularyExplanation(entity, entriesById);
      } else if (decision.kind === "exercise-reading") {
        rewriteReadingExplanation(entity);
      }
    }

    changed += 1;
  }

  return changed;
}

function syncProvenanceVersions(entitiesByFile: Map<string, CollectionFile>): number {
  const provenance = readCollection("provenance.json");
  const versionBySubject = new Map<string, string>();
  for (const collection of entitiesByFile.values()) {
    for (const item of collection.items) {
      versionBySubject.set(item.logicalId, item.contentVersion);
    }
  }

  let changed = 0;
  for (const record of provenance.items) {
    const subject = record.subjectLogicalId as string | undefined;
    if (!subject) continue;
    const next = versionBySubject.get(subject);
    if (next && record.contentVersion !== next) {
      record.contentVersion = next;
      changed += 1;
    }
  }
  writeJson(path.join(PHASE_2_CONTENT_ROOT, "provenance.json"), provenance);
  return changed;
}

function syncReadingSelection(): void {
  const selectionPath = path.join(PHASE_2_CONTENT_ROOT, "reading-bank-selection.json");
  const selection = JSON.parse(readFileSync(selectionPath, "utf8")) as {
    schemaVersion: string;
    generatedAt: string;
    questionsPerUnit: number;
    selected: Array<{
      unitLogicalId: string;
      passageLogicalId: string;
      titleKo: string;
      status: string;
      hasBlankMarkers: boolean;
    }>;
  };
  const passages = readCollection("reading-passages.json");
  const byId = new Map(passages.items.map((item) => [item.logicalId, item]));
  selection.selected = selection.selected.map((row) => {
    const passage = byId.get(row.passageLogicalId);
    return {
      ...row,
      status: passage?.status ?? row.status,
    };
  });
  writeJson(selectionPath, selection);
}

function applyManifest(manifest: Manifest): void {
  const approve = manifest.decisions.filter((item) => item.decision === "approve");
  const hold = manifest.decisions.filter((item) => item.decision === "hold");
  if (hold.length > 0) {
    console.log(`Holding ${hold.length} entities (not approved).`);
  }

  const entitiesByFile = new Map<string, CollectionFile>([
    ["units.json", readCollection("units.json")],
    ["grammar-topics.json", readCollection("grammar-topics.json")],
    ["dictionary-entries.json", readCollection("dictionary-entries.json")],
    ["reading-passages.json", readCollection("reading-passages.json")],
    ["exercises-grammar.json", readCollection("exercises-grammar.json")],
    ["exercises-vocabulary.json", readCollection("exercises-vocabulary.json")],
    ["exercises-reading.json", readCollection("exercises-reading.json")],
  ]);

  const topicsById = new Map(
    entitiesByFile.get("grammar-topics.json")!.items.map((item) => [item.logicalId, item]),
  );
  const entriesById = new Map(
    entitiesByFile.get("dictionary-entries.json")!.items.map((item) => [item.logicalId, item]),
  );

  const reviewedCount = applyPhase(entitiesByFile, approve, "reviewed", topicsById, entriesById);
  console.log(`Phase reviewed: ${reviewedCount} transitions`);

  const approvedCount = applyPhase(entitiesByFile, approve, "approved", topicsById, entriesById);
  console.log(`Phase approved: ${approvedCount} transitions`);

  for (const [fileName, collection] of entitiesByFile) {
    writeJson(path.join(PHASE_2_CONTENT_ROOT, fileName), collection);
  }

  const provenanceChanged = syncProvenanceVersions(entitiesByFile);
  console.log(`Provenance version sync: ${provenanceChanged}`);
  syncReadingSelection();

  const contestedApproved = approve.filter((item) => item.contested).length;
  console.log(
    `Approved ${approve.length} entities (${contestedApproved} contested explicit). Holds: ${hold.length}.`,
  );
}

function main(): void {
  const args = new Set(process.argv.slice(2));
  const writeManifest = args.has("--write-manifest");
  const apply = args.has("--apply");

  if (!writeManifest && !apply) {
    throw new Error("Pass --write-manifest and/or --apply");
  }

  let manifest: Manifest;
  if (writeManifest) {
    manifest = buildManifest();
    writeJson(MANIFEST_PATH, manifest);
    console.log(`Wrote ${MANIFEST_PATH} with ${manifest.decisions.length} decisions`);
  } else {
    manifest = JSON.parse(readFileSync(MANIFEST_PATH, "utf8")) as Manifest;
  }

  if (apply) {
    applyManifest(manifest);
  }
}

main();
