import { describe, expect, it, vi } from "vitest";

import {
  assertPublicSchemaExcludesServerSecrets,
  EnvValidationError,
  parsePublicSupabaseEnv,
  publicSupabaseEnvSchema,
  SERVER_ONLY_SUPABASE_ENV_KEYS,
} from "./env";

const validPublic = {
  NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54321",
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_test_key",
} as const;

describe("parsePublicSupabaseEnv", () => {
  it("parses valid public env", () => {
    expect(parsePublicSupabaseEnv(validPublic)).toEqual({
      url: "http://127.0.0.1:54321",
      publishableKey: "sb_publishable_test_key",
    });
  });

  it("rejects missing values", () => {
    expect(() => parsePublicSupabaseEnv({})).toThrow(EnvValidationError);
  });

  it("rejects malformed URL", () => {
    expect(() =>
      parsePublicSupabaseEnv({
        ...validPublic,
        NEXT_PUBLIC_SUPABASE_URL: "not-a-url",
      }),
    ).toThrow(EnvValidationError);
  });

  it("rejects empty publishable key", () => {
    expect(() =>
      parsePublicSupabaseEnv({
        ...validPublic,
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "   ",
      }),
    ).toThrow(EnvValidationError);
  });

  it("does not include server secrets in the public schema", () => {
    expect(SERVER_ONLY_SUPABASE_ENV_KEYS).toContain("SUPABASE_SECRET_KEY");
    expect(Object.keys(publicSupabaseEnvSchema.shape)).not.toContain("SUPABASE_SECRET_KEY");
    expect(() => assertPublicSchemaExcludesServerSecrets()).not.toThrow();
  });
});

describe("server env boundary", () => {
  it("parses server secrets only via serverEnv module", async () => {
    vi.resetModules();
    vi.doMock("server-only", () => ({}));
    const { parseServerSupabaseEnv } = await import("@/lib/supabase/serverEnv");

    expect(
      parseServerSupabaseEnv({
        SUPABASE_SECRET_KEY: "sb_secret_test_key",
      }),
    ).toEqual({ secretKey: "sb_secret_test_key" });

    try {
      parseServerSupabaseEnv({});
      expect.unreachable("expected missing secret to throw");
    } catch (error) {
      expect(error).toMatchObject({
        code: "ENV_VALIDATION_FAILED",
        name: "EnvValidationError",
      });
    }
  });
});
