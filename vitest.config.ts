import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Projects configuration for Vitest v4
    // Each project references its own vitest.config.ts for specific settings
    projects: ["apps/*", "!apps/storybook", "packages/*"],
  },
});
