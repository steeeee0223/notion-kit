import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Projects configuration for Vitest v4
    // Each project references its own vitest.config.ts for specific settings
    // Docs uses React Router Vite plugins and has no unit-test project.
    projects: ["apps/*", "!apps/docs", "packages/*"],
  },
});
