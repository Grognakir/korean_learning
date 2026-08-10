"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";

import type { AdminActionResult } from "@/features/admin/actions/AdminActionResult";
import {
  optionalTrimmedString,
  parseIntOrNull,
  zodFieldErrors,
} from "@/features/admin/actions/formDataHelpers";
import {
  AdminRepositoryError,
  upsertGrammarTopic,
} from "@/features/admin/data/adminContentRepository";
import { grammarTopicFormSchema } from "@/features/admin/domain/adminSchemas";
import { requireAdminSession } from "@/features/admin/server/requireAdminSession";

export async function saveGrammarTopicAction(
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
    moduleId: String(formData.get("moduleId") ?? ""),
    code: String(formData.get("code") ?? ""),
    logicalId: String(formData.get("logicalId") ?? ""),
    patternKo: String(formData.get("patternKo") ?? ""),
    category: String(formData.get("category") ?? ""),
    usageKey: optionalTrimmedString(formData.get("usageKey")),
    titleRu: String(formData.get("titleRu") ?? ""),
    titleKo: optionalTrimmedString(formData.get("titleKo")),
    summaryRu: String(formData.get("summaryRu") ?? ""),
    summaryKo: optionalTrimmedString(formData.get("summaryKo")),
    bodyMd: String(formData.get("bodyMd") ?? ""),
    level: String(formData.get("level") ?? ""),
    contentVersion: String(formData.get("contentVersion") ?? ""),
    status: String(formData.get("status") ?? "draft"),
    sortOrder: parseIntOrNull(formData.get("sortOrder")) ?? 0,
  };

  const parsed = grammarTopicFormSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, fieldErrors: zodFieldErrors(parsed.error) };
  }

  try {
    await upsertGrammarTopic(parsed.data);
    updateTag("curriculum-catalog");
    redirect("/admin/grammar");
  } catch (error) {
    if (error instanceof AdminRepositoryError) {
      return { ok: false, formError: error.message };
    }
    throw error;
  }
}
