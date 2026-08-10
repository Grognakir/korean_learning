"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";

import {
  AdminDeleteBlockedError,
  deleteUnit,
} from "@/features/admin/data/adminContentRepository";
import { requireAdminSession } from "@/features/admin/server/requireAdminSession";

export async function deleteUnitAction(
  id: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    await requireAdminSession();
  } catch {
    redirect("/admin/login");
  }

  try {
    await deleteUnit(id);
  } catch (error) {
    if (error instanceof AdminDeleteBlockedError) {
      return { ok: false, error: error.message };
    }
    throw error;
  }

  updateTag("curriculum-catalog");
  updateTag("learning-modules");
  redirect("/admin/units");
}
