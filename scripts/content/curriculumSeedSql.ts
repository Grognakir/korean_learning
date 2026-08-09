import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";

import { loadPhase2ContentGraph, PHASE_2_CONTENT_ROOT } from "./contentValidation";

const DEFAULT_DICTIONARY_HOME_UNIT = "unit.u01";

export function sqlString(value: string | null | undefined): string {
  if (value === null || value === undefined) {
    return "null";
  }
  return `'${value.replace(/'/g, "''")}'`;
}

export function sqlJson(value: unknown): string {
  return `'${JSON.stringify(value).replace(/'/g, "''")}'::jsonb`;
}

/** Deterministic UUID (version-shaped) from a stable key. */
export function uuidFromKey(key: string): string {
  const bytes = Buffer.from(createHash("sha256").update(key).digest().subarray(0, 16));
  bytes[6] = (bytes[6]! & 0x0f) | 0x40;
  bytes[8] = (bytes[8]! & 0x3f) | 0x80;
  const hex = bytes.toString("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}

function hashRecord(parts: readonly string[]): string {
  return createHash("sha256").update(parts.join("|")).digest("hex");
}

type AuthoringStatus = "draft" | "needs_review" | "reviewed" | "approved" | "archived";

export function mapContentStatus(
  status: AuthoringStatus,
): "draft" | "reviewed" | "published" | "archived" {
  switch (status) {
    case "reviewed":
      return "reviewed";
    case "approved":
      return "published";
    case "archived":
      return "archived";
    case "draft":
    case "needs_review":
    default:
      return "draft";
  }
}

export function mapExerciseStatus(
  status: AuthoringStatus,
): "draft" | "reviewed" | "approved" | "rejected" | "archived" {
  switch (status) {
    case "reviewed":
      return "reviewed";
    case "approved":
      return "approved";
    case "archived":
      return "archived";
    case "draft":
    case "needs_review":
    default:
      return "draft";
  }
}

export function mapDifficulty(
  value: "intro" | "practice" | "challenge",
): "easy" | "medium" | "hard" {
  switch (value) {
    case "intro":
      return "easy";
    case "challenge":
      return "hard";
    case "practice":
    default:
      return "medium";
  }
}

function sourceKeyFromSourceId(sourceId: string): string {
  return sourceId.startsWith("src.") ? sourceId.slice(4) : sourceId;
}

function entityTypeForLogicalId(
  logicalId: string,
): "learning_module" | "grammar_topic" | "dictionary_entry" | "reading_passage" | "exercise" {
  if (logicalId.startsWith("unit.")) return "learning_module";
  if (logicalId.startsWith("grammar.")) return "grammar_topic";
  if (logicalId.startsWith("dict.")) return "dictionary_entry";
  if (logicalId.startsWith("passage.")) return "reading_passage";
  if (logicalId.startsWith("exercise.")) return "exercise";
  throw new Error(`Unsupported provenance subject: ${logicalId}`);
}

export type CurriculumSeedMode = "insert" | "upsert";

export type CurriculumSeedStats = {
  modules: number;
  grammarTopics: number;
  dictionaryEntries: number;
  dictionaryLinks: number;
  readingPassages: number;
  exercises: number;
  exerciseOptions: number;
  provenance: number;
};

export function buildCurriculumSeedSql(
  mode: CurriculumSeedMode = "insert",
  rootDirectory: string = PHASE_2_CONTENT_ROOT,
): { sql: string; stats: CurriculumSeedStats } {
  const graph = loadPhase2ContentGraph(rootDirectory);
  const lines: string[] = [
    "-- Phase-2 canonical curriculum seed (generated; sample module stays separate).",
  ];

  if (mode === "upsert") {
    lines.push(
      "-- Upsert mode: content fields refresh; existing status is never elevated by import.",
      "delete from public.content_provenance",
      "where entity_logical_id like 'unit.%'",
      "   or entity_logical_id like 'grammar.%'",
      "   or entity_logical_id like 'dict.%'",
      "   or entity_logical_id like 'passage.%'",
      "   or entity_logical_id like 'exercise.%';",
      "",
    );
  }

  const moduleIdByLogical = new Map<string, string>();
  for (const unit of graph.units.items) {
    const id = uuidFromKey(`module:${unit.logicalId}@${unit.contentVersion}`);
    moduleIdByLogical.set(unit.logicalId, id);
    const status = mapContentStatus(unit.status);
    const description = unit.summary?.ru ?? unit.title.ru;
    if (mode === "insert") {
      lines.push(
        "insert into public.learning_modules (",
        "  id, slug, level, title_ko, title_ru, description_ru, status, content_version, sort_order, unit_number",
        ") values (",
        `  '${id}',`,
        `  ${sqlString(unit.slug)},`,
        `  ${sqlString("1급")},`,
        `  ${sqlString(unit.title.ko)},`,
        `  ${sqlString(unit.title.ru)},`,
        `  ${sqlString(description)},`,
        `  '${status}',`,
        `  ${sqlString(unit.contentVersion)},`,
        `  ${unit.unitNumber},`,
        `  ${unit.unitNumber}`,
        ");",
        "",
      );
    } else {
      lines.push(
        "insert into public.learning_modules (",
        "  id, slug, level, title_ko, title_ru, description_ru, status, content_version, sort_order, unit_number",
        ") values (",
        `  '${id}',`,
        `  ${sqlString(unit.slug)},`,
        `  ${sqlString("1급")},`,
        `  ${sqlString(unit.title.ko)},`,
        `  ${sqlString(unit.title.ru)},`,
        `  ${sqlString(description)},`,
        `  '${status}',`,
        `  ${sqlString(unit.contentVersion)},`,
        `  ${unit.unitNumber},`,
        `  ${unit.unitNumber}`,
        ")",
        "on conflict (slug, content_version) do update set",
        "  title_ko = excluded.title_ko,",
        "  title_ru = excluded.title_ru,",
        "  description_ru = excluded.description_ru,",
        "  sort_order = excluded.sort_order,",
        "  unit_number = excluded.unit_number,",
        "  level = excluded.level,",
        "  status = learning_modules.status;",
        "",
      );
    }
  }

  const topicIdByLogical = new Map<string, string>();
  for (const topic of graph.grammarTopics.items) {
    const moduleId = moduleIdByLogical.get(topic.unitLogicalId);
    if (!moduleId) {
      throw new Error(`Missing module for grammar topic ${topic.logicalId}`);
    }
    const id = uuidFromKey(`topic:${topic.logicalId}@${topic.contentVersion}`);
    topicIdByLogical.set(topic.logicalId, id);
    const code = topic.logicalId.replace(/^grammar\./, "");
    const sortOrder = Number(code.match(/n(\d+)$/)?.[1] ?? 0);
    const status = mapContentStatus(topic.status);
    const conflict =
      mode === "upsert"
        ? [
            "on conflict (logical_id, content_version) do update set",
            "  module_id = excluded.module_id,",
            "  code = excluded.code,",
            "  title = excluded.title,",
            "  summary_ru = excluded.summary_ru,",
            "  rule_payload = excluded.rule_payload,",
            "  pattern_ko = excluded.pattern_ko,",
            "  category = excluded.category,",
            "  usage_key = excluded.usage_key,",
            "  sort_order = excluded.sort_order,",
            "  status = grammar_topics.status;",
          ]
        : [";"];

    lines.push(
      "insert into public.grammar_topics (",
      "  id, module_id, code, title, summary_ru, rule_payload, level, status, sort_order, content_version,",
      "  logical_id, pattern_ko, category, usage_key",
      ") values (",
      `  '${id}',`,
      `  '${moduleId}',`,
      `  ${sqlString(code)},`,
      `  ${sqlString(topic.title.ru)},`,
      `  ${sqlString(topic.summary?.ru ?? topic.title.ru)},`,
      `  ${sqlJson({ titleKo: topic.title.ko, summaryKo: topic.summary?.ko ?? topic.title.ko })},`,
      `  ${sqlString("1급")},`,
      `  '${status}',`,
      `  ${sortOrder},`,
      `  ${sqlString(topic.contentVersion)},`,
      `  ${sqlString(topic.logicalId)},`,
      `  ${sqlString(topic.patternKo)},`,
      `  ${sqlString(topic.category)},`,
      `  ${sqlString(topic.usageKey)}`,
      ")",
      ...conflict,
      "",
    );
  }

  const dictIdByLogical = new Map<string, string>();
  const homeModuleId =
    moduleIdByLogical.get(DEFAULT_DICTIONARY_HOME_UNIT) ?? [...moduleIdByLogical.values()][0];
  if (!homeModuleId) {
    throw new Error("No curriculum modules available for dictionary home module");
  }

  for (const entry of graph.dictionaryEntries.items) {
    const id = uuidFromKey(`dict:${entry.logicalId}@${entry.contentVersion}`);
    dictIdByLogical.set(entry.logicalId, id);
    const status = mapContentStatus(entry.status);
    const conflict =
      mode === "upsert"
        ? [
            "on conflict (logical_id, content_version) do update set",
            "  lemma_ko = excluded.lemma_ko,",
            "  normalized_lemma_ko = excluded.normalized_lemma_ko,",
            "  part_of_speech = excluded.part_of_speech,",
            "  meanings_ru = excluded.meanings_ru,",
            "  sense_key = excluded.sense_key,",
            "  transliteration = excluded.transliteration,",
            "  level = excluded.level,",
            "  status = dictionary_entries.status;",
          ]
        : [";"];

    lines.push(
      "insert into public.dictionary_entries (",
      "  id, module_id, lemma_ko, normalized_lemma_ko, part_of_speech, meanings_ru, usage_note_ru,",
      "  status, content_version, logical_id, sense_key, transliteration, level",
      ") values (",
      `  '${id}',`,
      `  '${homeModuleId}',`,
      `  ${sqlString(entry.lemma)},`,
      `  ${sqlString(entry.lemma.normalize("NFC"))},`,
      `  ${sqlString(entry.pos ?? "unspecified")},`,
      `  ${sqlJson([entry.gloss.ru])},`,
      "  null,",
      `  '${status}',`,
      `  ${sqlString(entry.contentVersion)},`,
      `  ${sqlString(entry.logicalId)},`,
      `  ${sqlString(entry.senseKey)},`,
      `  ${sqlString(entry.transliteration)},`,
      `  ${sqlString(entry.level)}`,
      ")",
      ...conflict,
      "",
    );
  }

  let dictionaryLinks = 0;
  for (const link of graph.dictionaryUnitLinks.items) {
    const entryId = dictIdByLogical.get(link.entryLogicalId);
    const moduleId = moduleIdByLogical.get(link.unitLogicalId);
    if (!entryId || !moduleId) {
      throw new Error(`Dangling dictionary unit link ${link.logicalId}`);
    }
    dictionaryLinks += 1;
    lines.push(
      "insert into public.dictionary_entry_modules (entry_id, module_id, role, sort_order)",
      `values ('${entryId}', '${moduleId}', '${link.role}', ${link.sortOrder})`,
      "on conflict (entry_id, module_id) do update set",
      "  role = excluded.role,",
      "  sort_order = excluded.sort_order;",
      "",
    );
  }

  const passageIdByLogical = new Map<string, string>();
  for (const passage of graph.readingPassages.items) {
    const moduleId = moduleIdByLogical.get(passage.unitLogicalId);
    if (!moduleId) {
      throw new Error(`Missing module for passage ${passage.logicalId}`);
    }
    const id = uuidFromKey(`passage:${passage.logicalId}@${passage.contentVersion}`);
    passageIdByLogical.set(passage.logicalId, id);
    const status = mapContentStatus(passage.status);
    const conflict =
      mode === "upsert"
        ? [
            "on conflict (logical_id, content_version) do update set",
            "  primary_module_id = excluded.primary_module_id,",
            "  title_ko = excluded.title_ko,",
            "  title_ru = excluded.title_ru,",
            "  body_ko = excluded.body_ko,",
            "  translation_ru = excluded.translation_ru,",
            "  status = reading_passages.status;",
          ]
        : [";"];

    lines.push(
      "insert into public.reading_passages (",
      "  id, logical_id, primary_module_id, title_ko, title_ru, body_ko, translation_ru, payload, status, content_version",
      ") values (",
      `  '${id}',`,
      `  ${sqlString(passage.logicalId)},`,
      `  '${moduleId}',`,
      `  ${sqlString(passage.title.ko)},`,
      `  ${sqlString(passage.title.ru)},`,
      `  ${sqlString(passage.bodyKo)},`,
      `  ${sqlString(passage.bodyRu)},`,
      "  '{}'::jsonb,",
      `  '${status}',`,
      `  ${sqlString(passage.contentVersion)}`,
      ")",
      ...conflict,
      "",
    );
  }

  let exerciseOptions = 0;
  const allExercises = [
    ...graph.exercisesGrammar.items,
    ...graph.exercisesVocabulary.items,
    ...graph.exercisesReading.items,
  ];

  for (const exercise of allExercises) {
    const moduleId = moduleIdByLogical.get(exercise.unitLogicalId);
    if (!moduleId) {
      throw new Error(`Missing module for exercise ${exercise.logicalId}`);
    }
    const id = uuidFromKey(`exercise:${exercise.logicalId}@${exercise.contentVersion}`);
    const topicId = exercise.grammarTopicLogicalId
      ? topicIdByLogical.get(exercise.grammarTopicLogicalId)
      : null;
    const passageId = exercise.readingPassageLogicalId
      ? passageIdByLogical.get(exercise.readingPassageLogicalId)
      : null;

    if (exercise.skill === "grammar" && !topicId) {
      throw new Error(`Grammar exercise missing topic: ${exercise.logicalId}`);
    }
    if (exercise.skill === "reading" && !passageId) {
      throw new Error(`Reading exercise missing passage: ${exercise.logicalId}`);
    }

    const status = mapExerciseStatus(exercise.status);
    const difficulty = mapDifficulty(exercise.difficulty);
    const payload = {
      correctOptionId: exercise.correctOptionId,
      optionIds: exercise.options.map((option) => option.id),
    };

    if (mode === "upsert") {
      lines.push(
        `delete from public.exercise_options where exercise_id = '${id}';`,
        `delete from public.exercise_topics where exercise_id = '${id}';`,
        `delete from public.exercise_dictionary_entries where exercise_id = '${id}';`,
        "",
      );
    }

    const conflict =
      mode === "upsert"
        ? [
            "on conflict (logical_id, content_version) do update set",
            "  module_id = excluded.module_id,",
            "  primary_topic_id = excluded.primary_topic_id,",
            "  reading_passage_id = excluded.reading_passage_id,",
            "  learning_skill = excluded.learning_skill,",
            "  type = excluded.type,",
            "  difficulty = excluded.difficulty,",
            "  prompt_ko = excluded.prompt_ko,",
            "  prompt_ru = excluded.prompt_ru,",
            "  payload = excluded.payload,",
            "  explanation_ru = excluded.explanation_ru,",
            "  status = exercises.status;",
          ]
        : [";"];

    lines.push(
      "insert into public.exercises (",
      "  id, logical_id, module_id, primary_topic_id, learning_skill, reading_passage_id, type, difficulty,",
      "  prompt_ko, prompt_ru, payload, explanation_ru, status, content_version, source",
      ") values (",
      `  '${id}',`,
      `  ${sqlString(exercise.logicalId)},`,
      `  '${moduleId}',`,
      `  ${topicId ? `'${topicId}'` : "null"},`,
      `  '${exercise.skill}',`,
      `  ${passageId ? `'${passageId}'` : "null"},`,
      `  '${exercise.exerciseType}',`,
      `  '${difficulty}',`,
      `  ${sqlString(exercise.prompt.ko)},`,
      `  ${sqlString(exercise.prompt.ru)},`,
      `  ${sqlJson(payload)},`,
      `  ${sqlString(exercise.explanation.ru)},`,
      `  '${status}',`,
      `  ${sqlString(exercise.contentVersion)},`,
      "  'manual'",
      ")",
      ...conflict,
      "",
    );

    if (topicId) {
      lines.push(
        "insert into public.exercise_topics (exercise_id, topic_id, role)",
        `values ('${id}', '${topicId}', 'primary')`,
        "on conflict do nothing;",
        "",
      );
    }

    for (const [index, option] of exercise.options.entries()) {
      exerciseOptions += 1;
      const optionRowId = uuidFromKey(`option:${exercise.logicalId}:${option.id}`);
      const isCorrect = exercise.correctOptionId === option.id;
      lines.push(
        "insert into public.exercise_options (",
        "  id, exercise_id, option_key, label_ko, label_ru, value_payload, is_correct, sort_order",
        ") values (",
        `  '${optionRowId}',`,
        `  '${id}',`,
        `  ${sqlString(option.id)},`,
        `  ${sqlString(option.label.ko)},`,
        `  ${sqlString(option.label.ru)},`,
        "  '{}'::jsonb,",
        `  ${isCorrect},`,
        `  ${index}`,
        ");",
        "",
      );
    }

    for (const dictLogicalId of exercise.dictionaryEntryLogicalIds) {
      const dictId = dictIdByLogical.get(dictLogicalId);
      if (!dictId) {
        throw new Error(`Exercise ${exercise.logicalId} dangling dictionary ${dictLogicalId}`);
      }
      lines.push(
        "insert into public.exercise_dictionary_entries (exercise_id, dictionary_entry_id, role)",
        `values ('${id}', '${dictId}', 'target')`,
        "on conflict do nothing;",
        "",
      );
    }
  }

  let provenance = 0;
  for (const row of graph.provenance.items) {
    if (row.logicalId.startsWith("prov.prov.")) {
      continue;
    }
    const entityType = entityTypeForLogicalId(row.subjectLogicalId);
    for (const ref of row.sourceRefs) {
      provenance += 1;
      const sourceKey = sourceKeyFromSourceId(ref.sourceId);
      const locator =
        typeof ref.locator === "object" && ref.locator
          ? `${ref.locator.kind}:${ref.locator.value}`
          : "section:unknown";
      const recordHash = hashRecord([
        row.subjectLogicalId,
        row.contentVersion,
        sourceKey,
        locator,
        row.notes ?? "",
      ]);
      const reviewState = mapContentStatus("draft");
      lines.push(
        "insert into public.content_provenance (",
        "  id, entity_type, entity_logical_id, content_version, source_id, locator, record_hash, confidence, review_state, note",
        ") values (",
        `  '${uuidFromKey(`prov:${row.logicalId}:${sourceKey}:${locator}`)}',`,
        `  '${entityType}',`,
        `  ${sqlString(row.subjectLogicalId)},`,
        `  ${sqlString(row.contentVersion)},`,
        `  (select id from public.content_sources where source_key = ${sqlString(sourceKey)}),`,
        `  ${sqlString(locator)},`,
        `  ${sqlString(recordHash)},`,
        `  '${ref.confidence}',`,
        `  '${reviewState}',`,
        `  ${sqlString(row.notes ?? null)}`,
        ");",
        "",
      );
    }
  }

  const stats: CurriculumSeedStats = {
    modules: graph.units.items.length,
    grammarTopics: graph.grammarTopics.items.length,
    dictionaryEntries: graph.dictionaryEntries.items.length,
    dictionaryLinks,
    readingPassages: graph.readingPassages.items.length,
    exercises: allExercises.length,
    exerciseOptions,
    provenance,
  };

  return { sql: `${lines.join("\n")}\n`, stats };
}

export function loadCurriculumSeedSqlFromDisk(mode: CurriculumSeedMode = "insert"): {
  sql: string;
  stats: CurriculumSeedStats;
} {
  // Touch manifest path so callers fail early if content missing.
  readFileSync(path.join(PHASE_2_CONTENT_ROOT, "source-manifest.json"), "utf8");
  return buildCurriculumSeedSql(mode);
}
