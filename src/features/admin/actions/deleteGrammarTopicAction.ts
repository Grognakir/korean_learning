"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";

import {
  AdminDeleteBlockedError,
  deleteGrammarTopic,
} from "@/features/admin/data/adminContentRepository";
import { requireAdminSession } from "@/features/admin/server/requireAdminSession";

export async function deleteGrammarTopicAction(
  id: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    await requireAdminSession();
  } catch {
    redirect("/admin/login");
  }

  try {
    await deleteGrammarTopic(id);
  } catch (error) {
    if (error instanceof AdminDeleteBlockedError) {
      return { ok: false, error: error.message };
    }
    throw error;
  }

  updateTag("curriculum-catalog");
  redirect("/admin/grammar");
}
