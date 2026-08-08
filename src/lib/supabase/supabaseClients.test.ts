import { createBrowserClient, createServerClient } from "@supabase/ssr";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createBrowserSupabaseClient } from "./browserClient";
import { checkSupabaseAuthHealth } from "./health";

vi.mock("@supabase/ssr", () => ({
  createBrowserClient: vi.fn(() => ({ kind: "browser" })),
  createServerClient: vi.fn(() => ({ kind: "server" })),
}));

const env = {
  url: "http://127.0.0.1:54321",
  publishableKey: "sb_publishable_test_key",
} as const;

describe("createBrowserSupabaseClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("passes URL and publishable key to createBrowserClient", () => {
    const client = createBrowserSupabaseClient(env);
    expect(client).toEqual({ kind: "browser" });
    expect(createBrowserClient).toHaveBeenCalledWith(env.url, env.publishableKey);
  });
});

describe("createServerSupabaseClientWithCookies", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    vi.doMock("server-only", () => ({}));
  });

  it("passes URL, key, and cookie adapter to createServerClient", async () => {
    const { createServerSupabaseClientWithCookies } = await import("./serverClient");
    const cookies = {
      getAll: vi.fn(() => [{ name: "sb-test", value: "1" }]),
      setAll: vi.fn(),
    };

    const client = createServerSupabaseClientWithCookies(cookies, env);
    expect(client).toEqual({ kind: "server" });
    expect(createServerClient).toHaveBeenCalledWith(env.url, env.publishableKey, { cookies });
  });
});

describe("checkSupabaseAuthHealth", () => {
  it("returns ok on successful health response", async () => {
    const fetchImpl = vi.fn(async () => new Response("{}", { status: 200 }));
    const result = await checkSupabaseAuthHealth(env, fetchImpl);

    expect(result.ok).toBe(true);
    expect(fetchImpl).toHaveBeenCalledWith(
      "http://127.0.0.1:54321/auth/v1/health",
      expect.objectContaining({
        method: "GET",
        headers: { apikey: env.publishableKey },
      }),
    );
  });

  it("returns controlled failure on non-OK status", async () => {
    const fetchImpl = vi.fn(async () => new Response("nope", { status: 503 }));
    const result = await checkSupabaseAuthHealth(env, fetchImpl);

    expect(result).toMatchObject({
      ok: false,
      message: "Auth health returned HTTP 503",
    });
  });
});

describe("client-safe barrel", () => {
  it("does not export server-only factories", async () => {
    const barrel = await import("./index");
    expect(barrel.createBrowserSupabaseClient).toBeTypeOf("function");
    expect(barrel.checkSupabaseAuthHealth).toBeTypeOf("function");
    expect(barrel).not.toHaveProperty("createServerSupabaseClient");
    expect(barrel).not.toHaveProperty("parseServerSupabaseEnv");
  });
});
