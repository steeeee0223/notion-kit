import path from "node:path";
import { fileURLToPath } from "node:url";
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import react from "@vitejs/plugin-react";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

const dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    react(),
    storybookTest({
      // The location of your Storybook config, main.js|ts
      configDir: path.join(dirname, ".storybook"),
      // This should match your package.json script to run Storybook
      // The --no-open flag will skip the automatic opening of a browser
      // storybookScript: "yarn storybook --no-open",
    }),
  ],
  resolve: {
    alias: {
      "@": path.join(dirname, "src"),
      // Storybook's Vitest addon still imports the pre-v5 browser context path.
      "@vitest/browser/context": "vitest/browser",
    },
  },
  test: {
    name: "storybook",
    // Enable browser mode
    browser: {
      enabled: true,
      // Make sure to install Playwright
      provider: playwright({}),
      headless: true,
      instances: [{ browser: "chromium" }],
    },
    setupFiles: ["./.storybook/vitest.setup.ts"],
  },
});
