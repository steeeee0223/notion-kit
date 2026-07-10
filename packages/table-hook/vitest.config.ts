import react from "@vitejs/plugin-react";
import type { PluginOption } from "vite";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react() as PluginOption],
  test: {
    name: "table-hook",
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "src/plugins/**/*.test.{ts,tsx}",
    ],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", ["html", { subdir: "coverage" }]],
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["src/__tests__/**"],
    },
  },
});
