import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    name: "ui",
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", ["html", { subdir: "coverage" }]],
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["src/__tests__/**"],
    },
  },
});
