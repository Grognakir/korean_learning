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
  getUnitForAdmin,
  upsertUnit,
} from "@/features/admin/data/adminContentRepository";
import {
  resolveNextContentVersion,
  unitFormSchema,
  unitNumberFromSlug,
  type UnitFormInput,
} from "@/features/admin/domain/adminSchemas";
import { requireAdminSession } from "@/features/admin/server/requireAdminSession";

function unitContentChanged(
  previous: UnitFormInput,
  next: {
    readonly slug: string;
    readonly level: string;
    readonly unitNumber: number | null;
    readonly titleKo: string;
    readonly titleRu: string;
    readonly descriptionRu: string;
    readonly status: string;
    readonly sortOrder: number;
  },
): boolean {
  return (
    previous.slug !== next.slug ||
    previous.level !== next.level ||
    previous.unitNumber !== next.unitNumber ||
    previous.titleKo !== next.titleKo ||
    previous.titleRu !== next.titleRu ||
    previous.descriptionRu !== next.descriptionRu ||
    previous.status !== next.status ||
    previous.sortOrder !== next.sortOrder
  );
}

export async function saveUnitAction(
  _prevState: AdminActionResult | null,
  formData: FormData,
): Promise<AdminActionResult> {
  try {
    await requireAdminSession();
  } catch {
    redirect("/admin/login");
  }

  const slug = String(formData.get("slug") ?? "");
  const id = optionalTrimmedString(formData.get("id")) ?? undefined;
  const existing = id ? await getUnitForAdmin(id) : undefined;

  const unitNumber = parseIntOrNull(formData.get("unitNumber")) ?? unitNumberFromSlug(slug);
  const fields = {
    id,
    slug,
    level: String(formData.get("level") ?? ""),
    unitNumber,
    titleKo: String(formData.get("titleKo") ?? ""),
    titleRu: String(formData.get("titleRu") ?? ""),
    descriptionRu: String(formData.get("descriptionRu") ?? ""),
    status: String(formData.get("status") ?? "draft"),
    sortOrder: unitNumber ?? 0,
  };

  const raw = {
    ...fields,
    contentVersion: resolveNextContentVersion({
      previousVersion: existing?.contentVersion,
      hasContentChanged: existing ? unitContentChanged(existing, fields) : true,
    }),
  };

  const parsed = unitFormSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, fieldErrors: zodFieldErrors(parsed.error) };
  }

  try {
    await upsertUnit(parsed.data);
    updateTag("curriculum-catalog");
    updateTag("learning-modules");
    updateTag(`learning-module:${parsed.data.slug}`);
    redirect("/admin/units");
  } catch (error) {
    if (error instanceof AdminRepositoryError) {
      return { ok: false, formError: error.message };
    }
    throw error;
  }
}
