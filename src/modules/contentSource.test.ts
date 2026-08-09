import { describe, expect, it } from "vitest";

import { describeContentSource } from "./contentSource";

const supabaseEnv = {
  VERCEL: "1",
  NEXT_PUBLIC_SUPABASE_URL: "https://project-ref.supabase.co",
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "publishable-key-placeholder",
  SUPABASE_SECRET_KEY: "secret-key-placeholder",
};

describe("describeContentSource", () => {
  it("names the Supabase project host when the store is used", () => {
    expect(describeContentSource(supabaseEnv)).toBe(
      "Content source: supabase (project-ref.supabase.co)",
    );
  });

  it("never exposes credentials", () => {
    const description = describeContentSource(supabaseEnv);

    expect(description).not.toContain("secret-key-placeholder");
    expect(description).not.toContain("publishable-key-placeholder");
  });

  it("names the explicit override that selected local fixtures", () => {
    expect(describeContentSource({ ...supabaseEnv, CONTENT_SOURCE: "local" })).toBe(
      "Content source: local fixtures (CONTENT_SOURCE=local)",
    );
  });

  it("marks an absent override so a silent fallback is recognisable", () => {
    expect(describeContentSource({})).toBe("Content source: local fixtures (CONTENT_SOURCE=unset)");
  });

  it("reports an unusable Supabase url instead of throwing", () => {
    expect(describeContentSource({ ...supabaseEnv, NEXT_PUBLIC_SUPABASE_URL: "project-ref" })).toBe(
      "Content source: supabase (invalid url)",
    );
  });
});
