import { defineConfig } from "tsdown";

import { baseConfig, withReactCompiler } from "@notion-kit/config/tsdown";

export default defineConfig((opts) => [
  {
    ...withReactCompiler(opts),
    entry: { index: "./src/index.ts" },
    clean: true,
    external: [/^@dnd-kit\//],
  },
  {
    ...baseConfig(opts),
    entry: { fns: "./src/fns/index.ts" },
    clean: false,
  },
]);
