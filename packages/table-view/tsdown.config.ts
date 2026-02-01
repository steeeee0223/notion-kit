import { defineConfig } from "tsdown";

import { withReactClient } from "@notion-kit/config/tsdown";

export default defineConfig((opts) => ({
  ...opts,
  /**
   * Not using `withReactCompiler`
   * since @tanstack/react-table is not compatible with react-compiler yet
   *
   * Adding "use no memo" directive to disable React Compiler
   * for the entire package in consuming applications
   */
  ...withReactClient(opts),
  banner: { js: '"use client";\n"use no memo";' },
  external: [/^@dnd-kit\//],
}));
