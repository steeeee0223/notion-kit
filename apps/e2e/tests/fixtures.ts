import { test as base, expect } from "@playwright/test";
import MCR from "monocart-coverage-reports";

import { coverageOptions } from "./coverage-options";

export const test = base.extend<{ collectCoverage: void }>({
  collectCoverage: [
    async ({ page }, runFixture) => {
      if (process.env.E2E_COVERAGE !== "1") {
        await runFixture();
        return;
      }

      await page.coverage.startJSCoverage({ resetOnNavigation: false });
      try {
        await runFixture();
      } finally {
        const coverage = await page.coverage.stopJSCoverage();
        await MCR(coverageOptions).add(coverage);
      }
    },
    { auto: true },
  ],
});

export { expect };
