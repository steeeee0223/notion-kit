import MCR from "monocart-coverage-reports";

import { coverageOptions } from "./coverage-options";

export default async function globalTeardown() {
  if (process.env.E2E_COVERAGE !== "1") return;

  await MCR(coverageOptions).generate();
}
