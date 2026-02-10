import { defineConfig } from "tsdown";

import { withReactCompiler } from "@notion-kit/config/tsdown";

export default defineConfig((opts) => ({
  ...opts,
  ...withReactCompiler(opts),
}));
