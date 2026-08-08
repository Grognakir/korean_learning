import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const getClaims = vi.fn(async () => ({ data: { claims: null }, error: null }));

vi.mock("@supabase/ssr", () => ({
  createServerClient: vi.fn(() => ({
    auth: {
      getClaims,
    },
  })),
}));

vi.mock("@/lib/validation/env", () => ({
  parsePublicSupabaseEnv: vi.fn(() => ({
    url: "http://127.0.0.1:54321",
    publishableKey: "sb_publishable_test",
  })),
}));

describe("updateSession", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("refreshes auth claims for incoming requests", async () => {
    const { updateSession } = await import("./updateSession");
    const request = new NextRequest("http://localhost:3000/training");

    const response = await updateSession(request);

    expect(getClaims).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(200);
  });
});
