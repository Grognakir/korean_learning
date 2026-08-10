import { z } from "zod";

export const contentVersionSchema = z
  .string()
  .trim()
  .regex(/^[0-9]+\.[0-9]+\.[0-9]+$/, "Версия должна быть в формате X.Y.Z");

export const contentLifecycleStatusSchema = z.enum([
  "draft",
  "reviewed",
  "published",
  "archived",
]);

/** Derives curriculum unit number from slug like `u01` / `u16`. */
export function unitNumberFromSlug(slug: string): number | null {
  const match = /^u0*([1-9]\d?)$/i.exec(slug.trim());
  if (!match) {
    return null;
  }
  const value = Number(match[1]);
  return value >= 1 && value <= 16 ? value : null;
}

/** Bumps the patch segment of an X.Y.Z version (invalid input resets to 1.0.0). */
export function bumpContentVersionPatch(version: string): string {
  const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(version.trim());
  if (!match) {
    return "1.0.0";
  }
  return `${match[1]}.${match[2]}.${Number(match[3]) + 1}`;
}

export function resolveNextContentVersion(input: {
  readonly previousVersion: string | undefined;
  readonly hasContentChanged: boolean;
}): string {
  if (!input.previousVersion) {
    return "1.0.0";
  }
  if (!input.hasContentChanged) {
    return input.previousVersion;
  }
  return bumpContentVersionPatch(input.previousVersion);
}

export const unitFormSchema = z.object({
  id: z.string().uuid().optional(),
  slug: z
    .string()
    .trim()
    .min(1)
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "kebab-case"),
  level: z.string().trim().min(1),
  unitNumber: z.number().int().min(1).max(16).nullable(),
  titleKo: z.string().trim().min(1),
  titleRu: z.string().trim().min(1),
  descriptionRu: z.string().trim().min(1),
  contentVersion: contentVersionSchema,
  status: contentLifecycleStatusSchema,
  sortOrder: z.number().int().min(0),
});

export const grammarTopicFormSchema = z.object({
  id: z.string().uuid().optional(),
  moduleId: z.string().uuid("Выберите юнит"),
  code: z
    .string()
    .trim()
    .min(1)
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "kebab-case"),
  logicalId: z.string().trim().min(1),
  patternKo: z.string().trim().min(1),
  category: z.string().trim().min(1),
  usageKey: z.string().trim().min(1).nullable(),
  titleRu: z.string().trim().min(1),
  titleKo: z.string().trim().min(1).nullable(),
  summaryRu: z.string().trim().min(1),
  summaryKo: z.string().trim().min(1).nullable(),
  bodyMd: z.string().trim().min(1),
  level: z.string().trim().min(1),
  contentVersion: contentVersionSchema,
  status: contentLifecycleStatusSchema,
  sortOrder: z.number().int().min(0),
});

export const dictionaryEntryFormSchema = z.object({
  id: z.string().uuid().optional(),
  logicalId: z.string().trim().min(1),
  senseKey: z.string().trim().min(1),
  lemmaKo: z.string().trim().min(1),
  partOfSpeech: z.string().trim().min(1),
  meaningsRu: z.array(z.string().trim().min(1)).min(1, "Нужно минимум одно значение"),
  usageNoteRu: z.string().trim().min(1).nullable(),
  transliteration: z.string().trim().min(1).nullable(),
  level: z.string().trim().min(1).nullable(),
  contentVersion: contentVersionSchema,
  status: contentLifecycleStatusSchema,
  primaryModuleId: z.string().uuid("Выберите юнит"),
});

export type UnitFormInput = z.infer<typeof unitFormSchema>;
export type GrammarTopicFormInput = z.infer<typeof grammarTopicFormSchema>;
export type DictionaryEntryFormInput = z.infer<typeof dictionaryEntryFormSchema>;
