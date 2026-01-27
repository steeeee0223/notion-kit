import { defineConfig } from "tsdown";

import { baseConfig } from "@notion-kit/config/tsdown";

export default defineConfig((opts) => ({
  ...opts,
  ...baseConfig(opts),
}));
