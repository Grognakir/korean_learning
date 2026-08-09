import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    clearMocks: true,
    environment: "jsdom",
    exclude: [
      "**/node_modules/**",
      "**/tests/integration/**",
      "**/tests/e2e/**",
      "**/tests/db/**",
      "**/scripts/content/**",
    ],
    restoreMocks: true,
    setupFiles: ["./tests/helpers/setup.ts"],
    coverage: {
      include: ["src/**/*.{ts,tsx}"],
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      reportsDirectory: "coverage",
    },
  },
});
