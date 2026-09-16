import path from "node:path";
import { defineConfig } from "@playwright/test";
import { z } from "zod";

import base from "../../../../apps/e2e/playwright.config.ts";

const repo = path.resolve(import.meta.dirname, "../../../..");
const app = path.join(repo, "apps/e2e");
const artifacts = z
  .string()
  .refine(path.isAbsolute, "VERIFY_ARTIFACTS must be an absolute path")
  .parse(process.env.VERIFY_ARTIFACTS);

export default defineConfig({
  ...base,
  testDir: import.meta.dirname,
  testMatch: "source-journeys.spec.mts",
  globalSetup: path.join(app, "tests/global-setup.ts"),
  globalTeardown: path.join(app, "tests/global-teardown.ts"),
  // Launch and check an owned server using SKILL.md before driving it.
  webServer: undefined,
  retries: 0,
  workers: 1,
  outputDir: path.join(artifacts, "tests"),
  reporter: [
    ["list"],
    ["html", { open: "never", outputFolder: path.join(artifacts, "report") }],
    ["json", { outputFile: path.join(artifacts, "results.json") }],
  ],
  use: { ...base.use, trace: "on", screenshot: "on" },
});
