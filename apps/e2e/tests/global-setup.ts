import MCR from "monocart-coverage-reports";

import { coverageOptions } from "./coverage-options";

export default function globalSetup() {
  if (process.env.E2E_COVERAGE !== "1") return;

  const report = MCR(coverageOptions);
  report.cleanCache();
}
