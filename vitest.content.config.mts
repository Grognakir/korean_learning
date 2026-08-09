import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    clearMocks: true,
    environment: "node",
    include: ["scripts/content/**/*.{test,spec}.ts"],
    restoreMocks: true,
  },
});
