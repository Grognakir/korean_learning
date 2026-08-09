import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    clearMocks: true,
    environment: "node",
    // One shared local Supabase: schema.reset mid-suite must not race other files.
    fileParallelism: false,
    include: ["tests/db/**/*.test.ts"],
    exclude: ["tests/db/rls.test.ts"],
    restoreMocks: true,
    testTimeout: 120_000,
    hookTimeout: 120_000,
    globalSetup: ["tests/db/globalSetup.ts"],
  },
});
