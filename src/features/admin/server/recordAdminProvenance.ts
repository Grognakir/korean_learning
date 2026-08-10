import "server-only";

import { createHash } from "node:crypto";

import type { ServiceRoleSupabaseClient } from "@/lib/supabase/serviceRoleClient";

export type AdminProvenanceInput = {
  entityType: "learning_module" | "grammar_topic" | "dictionary_entry";
  entityLogicalId: string;
  contentVersion: string;
  payload: unknown;
};

async function ensureAdminSourceId(supabase: ServiceRoleSupabaseClient): Promise<string> {
  const { data, error } = await supabase
    .from("content_sources")
    .upsert(
      {
        source_key: "admin-panel",
        kind: "admin-panel",
        display_label: "Админ-панель",
        derived: false,
      },
      { onConflict: "source_key" },
    )
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to ensure admin content source");
  }

  return data.id;
}

/**
 * Best-effort provenance write. Failures are logged and never thrown.
 */
export async function recordAdminProvenance(
  supabase: ServiceRoleSupabaseClient,
  input: AdminProvenanceInput,
): Promise<void> {
  try {
    const sourceId = await ensureAdminSourceId(supabase);
    const recordHash = createHash("sha256").update(JSON.stringify(input.payload)).digest("hex");
    const locator = `admin-panel:${new Date().toISOString()}`;

    const { error } = await supabase.from("content_provenance").insert({
      entity_type: input.entityType,
      entity_logical_id: input.entityLogicalId,
      content_version: input.contentVersion,
      source_id: sourceId,
      locator,
      record_hash: recordHash,
      confidence: "high",
    });

    if (error) {
      console.error("Failed to record admin provenance", error);
    }
  } catch (error) {
    console.error("Failed to record admin provenance", error);
  }
}
