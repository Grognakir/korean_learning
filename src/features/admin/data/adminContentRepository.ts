import "server-only";

import {
  createServiceRoleSupabaseClient,
  type ServiceRoleSupabaseClient,
} from "@/lib/supabase/serviceRoleClient";
import type { Json } from "@/types/database";

import type {
  DictionaryEntryFormInput,
  GrammarTopicFormInput,
  UnitFormInput,
} from "@/features/admin/domain/adminSchemas";
import { compareByUpdatedAtThenUnitNumber } from "@/features/admin/presentation/adminUiHelpers";
import { recordAdminProvenance } from "@/features/admin/server/recordAdminProvenance";

export class AdminRepositoryError extends Error {
  constructor(message: string, cause?: unknown) {
    super(message, cause !== undefined ? { cause } : undefined);
    this.name = "AdminRepositoryError";
  }
}

export class AdminDeleteBlockedError extends Error {
  constructor(
    message = "Нельзя удалить: есть связанные записи. Сначала удалите или отвяжите их.",
  ) {
    super(message);
    this.name = "AdminDeleteBlockedError";
  }
}

export type UnitOption = {
  id: string;
  slug: string;
  titleRu: string;
  unitNumber: number | null;
};

export type AdminUnitListItem = {
  id: string;
  slug: string;
  titleKo: string;
  titleRu: string;
  level: string;
  status: UnitFormInput["status"];
  contentVersion: string;
  unitNumber: number | null;
  updatedAt: string;
};

export type AdminGrammarTopicListItem = {
  id: string;
  logicalId: string;
  moduleId: string;
  patternKo: string;
  titleRu: string;
  status: GrammarTopicFormInput["status"];
  contentVersion: string;
  sortOrder: number;
  updatedAt: string;
};

export type AdminDictionaryEntryListItem = {
  id: string;
  logicalId: string;
  lemmaKo: string;
  partOfSpeech: string;
  status: DictionaryEntryFormInput["status"];
  contentVersion: string;
  primaryModuleId: string;
  updatedAt: string;
};

type GrammarRulePayload = {
  titleKo?: string;
  summaryKo?: string;
  detail?: {
    bodyMd?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
};

function throwOnError(message: string, error: { message?: string } | null | undefined): void {
  if (error) {
    throw new AdminRepositoryError(message, error);
  }
}

function compactJson<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function asStringArray(value: Json | null | undefined): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter((item): item is string => typeof item === "string");
}

function asRulePayload(value: Json | null | undefined): GrammarRulePayload {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }
  return value as GrammarRulePayload;
}

function buildGrammarRulePayload(
  input: GrammarTopicFormInput,
  existing: GrammarRulePayload = {},
): GrammarRulePayload {
  const next: GrammarRulePayload = {
    ...existing,
    detail: {
      ...(existing.detail ?? {}),
      bodyMd: input.bodyMd,
    },
  };

  if (input.titleKo != null) {
    next.titleKo = input.titleKo;
  } else {
    delete next.titleKo;
  }

  if (input.summaryKo != null) {
    next.summaryKo = input.summaryKo;
  } else {
    delete next.summaryKo;
  }

  return compactJson(next);
}

function mapUnitRowToForm(row: {
  id: string;
  slug: string;
  level: string;
  unit_number: number | null;
  title_ko: string;
  title_ru: string;
  description_ru: string;
  content_version: string;
  status: UnitFormInput["status"];
  sort_order: number;
}): UnitFormInput {
  return {
    id: row.id,
    slug: row.slug,
    level: row.level,
    unitNumber: row.unit_number,
    titleKo: row.title_ko,
    titleRu: row.title_ru,
    descriptionRu: row.description_ru,
    contentVersion: row.content_version,
    status: row.status,
    sortOrder: row.sort_order,
  };
}

function mapGrammarRowToForm(row: {
  id: string;
  module_id: string;
  code: string;
  logical_id: string;
  pattern_ko: string;
  category: string;
  usage_key: string | null;
  title: string;
  summary_ru: string;
  rule_payload: Json | null;
  level: string;
  content_version: string;
  status: GrammarTopicFormInput["status"];
  sort_order: number;
}): GrammarTopicFormInput {
  const payload = asRulePayload(row.rule_payload);
  return {
    id: row.id,
    moduleId: row.module_id,
    code: row.code,
    logicalId: row.logical_id,
    patternKo: row.pattern_ko,
    category: row.category,
    usageKey: row.usage_key,
    titleRu: row.title,
    titleKo: payload.titleKo ?? null,
    summaryRu: row.summary_ru,
    summaryKo: payload.summaryKo ?? null,
    bodyMd: payload.detail?.bodyMd ?? "",
    level: row.level,
    contentVersion: row.content_version,
    status: row.status,
    sortOrder: row.sort_order,
  };
}

function mapDictionaryRowToForm(row: {
  id: string;
  logical_id: string;
  sense_key: string;
  lemma_ko: string;
  part_of_speech: string;
  meanings_ru: Json;
  usage_note_ru: string | null;
  transliteration: string | null;
  level: string | null;
  content_version: string;
  status: DictionaryEntryFormInput["status"];
  module_id: string;
}): DictionaryEntryFormInput {
  return {
    id: row.id,
    logicalId: row.logical_id,
    senseKey: row.sense_key,
    lemmaKo: row.lemma_ko,
    partOfSpeech: row.part_of_speech,
    meaningsRu: asStringArray(row.meanings_ru),
    usageNoteRu: row.usage_note_ru,
    transliteration: row.transliteration,
    level: row.level,
    contentVersion: row.content_version,
    status: row.status,
    primaryModuleId: row.module_id,
  };
}

export async function listUnitOptions(
  supabase: ServiceRoleSupabaseClient = createServiceRoleSupabaseClient(),
): Promise<UnitOption[]> {
  const { data, error } = await supabase
    .from("learning_modules")
    .select("id, slug, title_ru, unit_number")
    .order("sort_order", { ascending: true });

  throwOnError("Failed to list unit options", error);

  return (data ?? []).map((row) => ({
    id: row.id,
    slug: row.slug,
    titleRu: row.title_ru,
    unitNumber: row.unit_number,
  }));
}

export async function listUnitsForAdmin(
  supabase: ServiceRoleSupabaseClient = createServiceRoleSupabaseClient(),
): Promise<AdminUnitListItem[]> {
  const { data, error } = await supabase
    .from("learning_modules")
    .select(
      "id, slug, title_ko, title_ru, level, status, content_version, unit_number, updated_at",
    )
    .order("updated_at", { ascending: false });

  throwOnError("Failed to list units for admin", error);

  return (data ?? [])
    .map((row) => ({
      id: row.id,
      slug: row.slug,
      titleKo: row.title_ko,
      titleRu: row.title_ru,
      level: row.level,
      status: row.status,
      contentVersion: row.content_version,
      unitNumber: row.unit_number,
      updatedAt: row.updated_at,
    }))
    .sort(compareByUpdatedAtThenUnitNumber);
}

export async function getUnitForAdmin(
  id: string,
  supabase: ServiceRoleSupabaseClient = createServiceRoleSupabaseClient(),
): Promise<UnitFormInput | undefined> {
  const { data, error } = await supabase
    .from("learning_modules")
    .select(
      "id, slug, level, unit_number, title_ko, title_ru, description_ru, content_version, status, sort_order",
    )
    .eq("id", id)
    .maybeSingle();

  throwOnError("Failed to load unit for admin", error);
  if (!data) {
    return undefined;
  }

  return mapUnitRowToForm(data);
}

export async function upsertUnit(
  input: UnitFormInput,
  supabase: ServiceRoleSupabaseClient = createServiceRoleSupabaseClient(),
): Promise<{ id: string }> {
  const row = {
    slug: input.slug,
    level: input.level,
    unit_number: input.unitNumber,
    title_ko: input.titleKo,
    title_ru: input.titleRu,
    description_ru: input.descriptionRu,
    content_version: input.contentVersion,
    status: input.status,
    sort_order: input.sortOrder,
  };

  const result = input.id
    ? await supabase.from("learning_modules").update(row).eq("id", input.id).select("id").single()
    : await supabase.from("learning_modules").insert(row).select("id").single();

  throwOnError(input.id ? "Failed to update unit" : "Failed to create unit", result.error);
  if (!result.data) {
    throw new AdminRepositoryError(input.id ? "Failed to update unit" : "Failed to create unit");
  }

  await recordAdminProvenance(supabase, {
    entityType: "learning_module",
    entityLogicalId: `unit.${input.slug}`,
    contentVersion: input.contentVersion,
    payload: input,
  });

  return { id: result.data.id };
}

export async function listGrammarTopicsForAdmin(
  supabase: ServiceRoleSupabaseClient = createServiceRoleSupabaseClient(),
): Promise<AdminGrammarTopicListItem[]> {
  const { data, error } = await supabase
    .from("grammar_topics")
    .select(
      "id, logical_id, module_id, pattern_ko, title, status, content_version, sort_order, updated_at",
    )
    .order("updated_at", { ascending: false });

  throwOnError("Failed to list grammar topics for admin", error);

  return (data ?? []).map((row) => ({
    id: row.id,
    logicalId: row.logical_id,
    moduleId: row.module_id,
    patternKo: row.pattern_ko,
    titleRu: row.title,
    status: row.status,
    contentVersion: row.content_version,
    sortOrder: row.sort_order,
    updatedAt: row.updated_at,
  }));
}

export async function getGrammarTopicForAdmin(
  id: string,
  supabase: ServiceRoleSupabaseClient = createServiceRoleSupabaseClient(),
): Promise<GrammarTopicFormInput | undefined> {
  const { data, error } = await supabase
    .from("grammar_topics")
    .select(
      "id, module_id, code, logical_id, pattern_ko, category, usage_key, title, summary_ru, rule_payload, level, content_version, status, sort_order",
    )
    .eq("id", id)
    .maybeSingle();

  throwOnError("Failed to load grammar topic for admin", error);
  if (!data) {
    return undefined;
  }

  return mapGrammarRowToForm(data);
}

export async function upsertGrammarTopic(
  input: GrammarTopicFormInput,
  supabase: ServiceRoleSupabaseClient = createServiceRoleSupabaseClient(),
): Promise<{ id: string }> {
  let existingPayload: GrammarRulePayload = {};
  if (input.id) {
    const existing = await supabase
      .from("grammar_topics")
      .select("rule_payload")
      .eq("id", input.id)
      .maybeSingle();
    throwOnError("Failed to load grammar topic payload", existing.error);
    existingPayload = asRulePayload(existing.data?.rule_payload ?? null);
  }

  const rulePayload = buildGrammarRulePayload(input, existingPayload);
  const row = {
    module_id: input.moduleId,
    code: input.code,
    logical_id: input.logicalId,
    pattern_ko: input.patternKo,
    category: input.category,
    usage_key: input.usageKey,
    title: input.titleRu,
    summary_ru: input.summaryRu,
    rule_payload: rulePayload as Json,
    level: input.level,
    content_version: input.contentVersion,
    status: input.status,
    sort_order: input.sortOrder,
  };

  const result = input.id
    ? await supabase.from("grammar_topics").update(row).eq("id", input.id).select("id").single()
    : await supabase.from("grammar_topics").insert(row).select("id").single();

  throwOnError(
    input.id ? "Failed to update grammar topic" : "Failed to create grammar topic",
    result.error,
  );
  if (!result.data) {
    throw new AdminRepositoryError(
      input.id ? "Failed to update grammar topic" : "Failed to create grammar topic",
    );
  }

  await recordAdminProvenance(supabase, {
    entityType: "grammar_topic",
    entityLogicalId: input.logicalId,
    contentVersion: input.contentVersion,
    payload: input,
  });

  return { id: result.data.id };
}

export async function listDictionaryEntriesForAdmin(
  supabase: ServiceRoleSupabaseClient = createServiceRoleSupabaseClient(),
): Promise<AdminDictionaryEntryListItem[]> {
  const { data, error } = await supabase
    .from("dictionary_entries")
    .select(
      "id, logical_id, lemma_ko, part_of_speech, status, content_version, module_id, updated_at",
    )
    .order("updated_at", { ascending: false });

  throwOnError("Failed to list dictionary entries for admin", error);

  return (data ?? []).map((row) => ({
    id: row.id,
    logicalId: row.logical_id,
    lemmaKo: row.lemma_ko,
    partOfSpeech: row.part_of_speech,
    status: row.status,
    contentVersion: row.content_version,
    primaryModuleId: row.module_id,
    updatedAt: row.updated_at,
  }));
}

export async function getDictionaryEntryForAdmin(
  id: string,
  supabase: ServiceRoleSupabaseClient = createServiceRoleSupabaseClient(),
): Promise<DictionaryEntryFormInput | undefined> {
  const { data, error } = await supabase
    .from("dictionary_entries")
    .select(
      "id, logical_id, sense_key, lemma_ko, part_of_speech, meanings_ru, usage_note_ru, transliteration, level, content_version, status, module_id",
    )
    .eq("id", id)
    .maybeSingle();

  throwOnError("Failed to load dictionary entry for admin", error);
  if (!data) {
    return undefined;
  }

  return mapDictionaryRowToForm(data);
}

export async function upsertDictionaryEntry(
  input: DictionaryEntryFormInput,
  supabase: ServiceRoleSupabaseClient = createServiceRoleSupabaseClient(),
): Promise<{ id: string }> {
  const row = {
    logical_id: input.logicalId,
    sense_key: input.senseKey,
    lemma_ko: input.lemmaKo,
    normalized_lemma_ko: input.lemmaKo.normalize("NFC"),
    part_of_speech: input.partOfSpeech,
    meanings_ru: input.meaningsRu as Json,
    usage_note_ru: input.usageNoteRu,
    transliteration: input.transliteration,
    level: input.level,
    content_version: input.contentVersion,
    status: input.status,
    module_id: input.primaryModuleId,
  };

  const result = input.id
    ? await supabase.from("dictionary_entries").update(row).eq("id", input.id).select("id").single()
    : await supabase.from("dictionary_entries").insert(row).select("id").single();

  throwOnError(
    input.id ? "Failed to update dictionary entry" : "Failed to create dictionary entry",
    result.error,
  );
  if (!result.data) {
    throw new AdminRepositoryError(
      input.id ? "Failed to update dictionary entry" : "Failed to create dictionary entry",
    );
  }

  const entryId = result.data.id;
  const linkResult = await supabase.from("dictionary_entry_modules").upsert(
    {
      entry_id: entryId,
      module_id: input.primaryModuleId,
      role: "primary",
    },
    { onConflict: "entry_id,module_id" },
  );

  throwOnError("Failed to upsert dictionary entry module link", linkResult.error);

  await recordAdminProvenance(supabase, {
    entityType: "dictionary_entry",
    entityLogicalId: input.logicalId,
    contentVersion: input.contentVersion,
    payload: input,
  });

  return { id: entryId };
}

type DeletableTable = "learning_modules" | "grammar_topics" | "dictionary_entries";

async function countRowsByColumn(
  supabase: ServiceRoleSupabaseClient,
  table:
    | "exercises"
    | "exercise_topics"
    | "user_topic_progress"
    | "mistake_events"
    | "grammar_topics"
    | "dictionary_entries"
    | "dictionary_entry_modules",
  column: string,
  id: string,
): Promise<number> {
  const { count, error } = await supabase
    .from(table)
    .select("*", { count: "exact", head: true })
    .eq(column, id);

  throwOnError(`Failed to count related rows in ${table}`, error);
  return count ?? 0;
}

function formatCountPart(label: string, count: number): string | null {
  return count > 0 ? `${label}: ${count}` : null;
}

async function grammarTopicDeleteBlockedMessage(
  supabase: ServiceRoleSupabaseClient,
  id: string,
): Promise<string> {
  const [primaryExercises, topicLinks, topicProgress, mistakeEvents] = await Promise.all([
    countRowsByColumn(supabase, "exercises", "primary_topic_id", id),
    countRowsByColumn(supabase, "exercise_topics", "topic_id", id),
    countRowsByColumn(supabase, "user_topic_progress", "topic_id", id),
    countRowsByColumn(supabase, "mistake_events", "primary_topic_id", id),
  ]);

  const parts = [
    formatCountPart("упражнений", primaryExercises),
    formatCountPart("доп. привязок к упражнениям", topicLinks),
    formatCountPart("записей прогресса", topicProgress),
    formatCountPart("событий ошибок", mistakeEvents),
  ].filter((part): part is string => part != null);

  if (parts.length === 0) {
    return "Нельзя удалить: есть связанные записи. Сначала удалите или отвяжите их.";
  }

  return `Нельзя удалить: ${parts.join(", ")}. Сначала удалите или отвяжите их.`;
}

async function deleteRow(
  supabase: ServiceRoleSupabaseClient,
  table: DeletableTable,
  id: string,
): Promise<void> {
  const { error } = await supabase.from(table).delete().eq("id", id);
  if (!error) {
    return;
  }

  if (error.code === "23503") {
    if (table === "grammar_topics") {
      throw new AdminDeleteBlockedError(await grammarTopicDeleteBlockedMessage(supabase, id));
    }
    throw new AdminDeleteBlockedError();
  }

  throw new AdminRepositoryError(`Failed to delete from ${table}`, error);
}

export async function deleteUnit(
  id: string,
  supabase: ServiceRoleSupabaseClient = createServiceRoleSupabaseClient(),
): Promise<void> {
  await deleteRow(supabase, "learning_modules", id);
}

export async function deleteGrammarTopic(
  id: string,
  supabase: ServiceRoleSupabaseClient = createServiceRoleSupabaseClient(),
): Promise<void> {
  await deleteRow(supabase, "grammar_topics", id);
}

export async function deleteDictionaryEntry(
  id: string,
  supabase: ServiceRoleSupabaseClient = createServiceRoleSupabaseClient(),
): Promise<void> {
  const linkResult = await supabase.from("dictionary_entry_modules").delete().eq("entry_id", id);
  if (linkResult.error) {
    console.error("Failed to delete dictionary entry module links", linkResult.error);
  }

  await deleteRow(supabase, "dictionary_entries", id);
}
