import { describe, expect, it, vi } from "vitest";

import {
  assertPublicSchemaExcludesServerSecrets,
  EnvValidationError,
  parseDeploymentSupabaseEnv,
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

const validDeployment = {
  VERCEL: "1",
  CONTENT_SOURCE: "supabase",
  NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_test_key",
  SUPABASE_SECRET_KEY: "sb_secret_test_key",
} as const;

describe("parseDeploymentSupabaseEnv", () => {
  it("passes with valid Supabase deployment env", () => {
    expect(parseDeploymentSupabaseEnv(validDeployment)).toEqual({
      url: "https://example.supabase.co",
      publishableKey: "sb_publishable_test_key",
      secretKey: "sb_secret_test_key",
    });
  });

  it("passes without Supabase keys when CONTENT_SOURCE=local", () => {
    expect(
      parseDeploymentSupabaseEnv({
        VERCEL: "1",
        CONTENT_SOURCE: "local",
      }),
    ).toBeNull();
  });

  it("skips validation outside deployment contexts", () => {
    expect(parseDeploymentSupabaseEnv({ NODE_ENV: "development" })).toBeNull();
  });

  it("rejects missing NEXT_PUBLIC_SUPABASE_URL", () => {
    expect(() =>
      parseDeploymentSupabaseEnv({
        ...validDeployment,
        NEXT_PUBLIC_SUPABASE_URL: "",
      }),
    ).toThrow(EnvValidationError);
  });

  it("rejects missing NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", () => {
    expect(() =>
      parseDeploymentSupabaseEnv({
        ...validDeployment,
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "",
      }),
    ).toThrow(EnvValidationError);
  });

  it("rejects missing SUPABASE_SECRET_KEY", () => {
    expect(() =>
      parseDeploymentSupabaseEnv({
        ...validDeployment,
        SUPABASE_SECRET_KEY: "",
      }),
    ).toThrow(EnvValidationError);
  });

  it("rejects all missing keys with key names in the message", () => {
    try {
      parseDeploymentSupabaseEnv({
        VERCEL: "1",
        CONTENT_SOURCE: "supabase",
      });
      expect.unreachable("expected validation failure");
    } catch (error) {
      expect(error).toMatchObject({
        code: "ENV_VALIDATION_FAILED",
        message: expect.stringContaining("NEXT_PUBLIC_SUPABASE_URL"),
      });
      expect((error as EnvValidationError).message).toContain(
        "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
      );
      expect((error as EnvValidationError).message).toContain("SUPABASE_SECRET_KEY");
    }
  });

  it("rejects malformed URL", () => {
    expect(() =>
      parseDeploymentSupabaseEnv({
        ...validDeployment,
        NEXT_PUBLIC_SUPABASE_URL: "not-a-url",
      }),
    ).toThrow(EnvValidationError);
  });
});
