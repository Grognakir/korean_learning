import { createHash } from "node:crypto";

import { afterEach, describe, expect, it, vi } from "vitest";

import type { ServiceRoleSupabaseClient } from "@/lib/supabase/serviceRoleClient";

import { recordAdminProvenance } from "./recordAdminProvenance";

afterEach(() => {
  vi.restoreAllMocks();
});

function createChain(result: { data: unknown; error: unknown }) {
  const chain: {
    select: ReturnType<typeof vi.fn>;
    insert: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    upsert: ReturnType<typeof vi.fn>;
    eq: ReturnType<typeof vi.fn>;
    order: ReturnType<typeof vi.fn>;
    single: ReturnType<typeof vi.fn>;
    maybeSingle: ReturnType<typeof vi.fn>;
    then: (onFulfilled: (value: unknown) => unknown, onRejected?: (reason: unknown) => unknown) => Promise<unknown>;
  } = {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    upsert: vi.fn(),
    eq: vi.fn(),
    order: vi.fn(),
    single: vi.fn(),
    maybeSingle: vi.fn(),
    then: (onFulfilled, onRejected) => Promise.resolve(result).then(onFulfilled, onRejected),
  };

  chain.select.mockReturnValue(chain);
  chain.insert.mockReturnValue(chain);
  chain.update.mockReturnValue(chain);
  chain.upsert.mockReturnValue(chain);
  chain.eq.mockReturnValue(chain);
  chain.order.mockReturnValue(chain);
  chain.single.mockResolvedValue(result);
  chain.maybeSingle.mockResolvedValue(result);

  return chain;
}

describe("recordAdminProvenance", () => {
  it("upserts the admin source and inserts a provenance row", async () => {
    const sourceChain = createChain({ data: { id: "source-1" }, error: null });
    const provenanceChain = createChain({ data: null, error: null });
    const from = vi.fn((table: string) => {
      if (table === "content_sources") {
        return sourceChain;
      }
      if (table === "content_provenance") {
        return provenanceChain;
      }
      throw new Error(`Unexpected table: ${table}`);
    });
    const supabase = { from } as unknown as ServiceRoleSupabaseClient;
    const payload = { slug: "unit-01" };
    const expectedHash = createHash("sha256").update(JSON.stringify(payload)).digest("hex");

    await recordAdminProvenance(supabase, {
      entityType: "learning_module",
      entityLogicalId: "unit.unit-01",
      contentVersion: "1.0.0",
      payload,
    });

    expect(sourceChain.upsert).toHaveBeenCalledWith(
      {
        source_key: "admin-panel",
        kind: "admin-panel",
        display_label: "Админ-панель",
        derived: false,
      },
      { onConflict: "source_key" },
    );
    expect(provenanceChain.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        entity_type: "learning_module",
        entity_logical_id: "unit.unit-01",
        content_version: "1.0.0",
        source_id: "source-1",
        record_hash: expectedHash,
        confidence: "high",
      }),
    );
    expect(provenanceChain.insert.mock.calls[0]?.[0].locator).toMatch(/^admin-panel:/);
  });

  it("swallows supabase errors without throwing", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const sourceChain = createChain({ data: { id: "source-1" }, error: null });
    const provenanceChain = createChain({
      data: null,
      error: { message: "insert failed" },
    });
    const supabase = {
      from: vi.fn((table: string) => (table === "content_sources" ? sourceChain : provenanceChain)),
    } as unknown as ServiceRoleSupabaseClient;

    await expect(
      recordAdminProvenance(supabase, {
        entityType: "grammar_topic",
        entityLogicalId: "grammar.u01.n01",
        contentVersion: "1.0.0",
        payload: { ok: true },
      }),
    ).resolves.toBeUndefined();

    expect(errorSpy).toHaveBeenCalled();
  });
});
