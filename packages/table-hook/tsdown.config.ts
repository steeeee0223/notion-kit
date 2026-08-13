import { defineConfig } from "tsdown";

import { baseConfig, withReactCompiler } from "@notion-kit/config/tsdown";

export default defineConfig((opts) => [
  {
    ...withReactCompiler(opts),
    entry: { index: "./src/index.ts" },
    clean: true,
    external: [/^@dnd-kit\//, "@notion-kit/table-hook/plugins"],
  },
  {
    ...baseConfig(opts),
    entry: { fns: "./src/fns/index.ts" },
    clean: false,
  },
  {
    ...withReactCompiler(opts),
    entry: { plugins: "./src/plugins/index.ts" },
    clean: false,
    external: [/^@dnd-kit\//],
  },
]);
