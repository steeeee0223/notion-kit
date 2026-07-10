import { defineConfig } from "tsdown";

import { withReactClient } from "@notion-kit/config/tsdown";

export default defineConfig((opts) => ({
  ...opts,
  ...withReactClient(opts),
  banner: { js: '"use client";\n"use no memo";' },
  external: [/^@dnd-kit\//],
}));
