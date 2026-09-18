import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Each project references its own vitest.config.ts for specific settings
    projects: ["apps/*", "!apps/storybook", "packages/*"],
  },
});
