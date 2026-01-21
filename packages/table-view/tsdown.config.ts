import { defineConfig } from "tsdown";

import { withReactClient } from "@notion-kit/config/tsdown";

export default defineConfig((opts) => ({
  ...opts,
  /**
   * Not using `withReactCompiler`
   * since @tanstack/react-table is not compatible with react-compiler yet
   */
  ...withReactClient(opts),
  external: [/^@dnd-kit\//],
}));
