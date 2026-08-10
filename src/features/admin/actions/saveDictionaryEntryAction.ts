"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";

import type { AdminActionResult } from "@/features/admin/actions/AdminActionResult";
import {
  optionalTrimmedString,
  parseMultilineList,
  zodFieldErrors,
} from "@/features/admin/actions/formDataHelpers";
import {
  AdminRepositoryError,
  upsertDictionaryEntry,
} from "@/features/admin/data/adminContentRepository";
import { dictionaryEntryFormSchema } from "@/features/admin/domain/adminSchemas";
import { requireAdminSession } from "@/features/admin/server/requireAdminSession";

export async function saveDictionaryEntryAction(
  _prevState: AdminActionResult | null,
  formData: FormData,
): Promise<AdminActionResult> {
  try {
    await requireAdminSession();
  } catch {
    redirect("/admin/login");
  }

  const raw = {
    id: optionalTrimmedString(formData.get("id")) ?? undefined,
    logicalId: String(formData.get("logicalId") ?? ""),
    senseKey: String(formData.get("senseKey") ?? ""),
    lemmaKo: String(formData.get("lemmaKo") ?? ""),
    partOfSpeech: String(formData.get("partOfSpeech") ?? ""),
    meaningsRu: parseMultilineList(formData.get("meaningsRu")),
    usageNoteRu: optionalTrimmedString(formData.get("usageNoteRu")),
    transliteration: optionalTrimmedString(formData.get("transliteration")),
    level: optionalTrimmedString(formData.get("level")),
    contentVersion: String(formData.get("contentVersion") ?? ""),
    status: String(formData.get("status") ?? "draft"),
    primaryModuleId: String(formData.get("primaryModuleId") ?? ""),
  };

  const parsed = dictionaryEntryFormSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, fieldErrors: zodFieldErrors(parsed.error) };
  }

  try {
    await upsertDictionaryEntry(parsed.data);
    updateTag("curriculum-dictionary");
    redirect("/admin/dictionary");
  } catch (error) {
    if (error instanceof AdminRepositoryError) {
      return { ok: false, formError: error.message };
    }
    throw error;
  }
}
