import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    clearMocks: true,
    environment: "node",
    include: ["tests/db/**/*.test.ts"],
    restoreMocks: true,
    testTimeout: 120_000,
    hookTimeout: 120_000,
    globalSetup: ["tests/db/globalSetup.ts"],
  },
});
