import { defineConfig } from "tsdown";

import { withReactCompiler } from "@notion-kit/config/tsdown";

const EXTERNAL_NOTION_KIT = /^@notion-kit\/(cn|utils|hooks|schemas|auth)/;

export default defineConfig((opts) => ({
  ...opts,
  ...withReactCompiler(opts),
  entry: {
    eject: "./src/eject.tsx",
    "falling-blocks": "./src/falling-blocks.tsx",
    "sling-shot": "./src/sling-shot/index.ts",
  },
  external: [
    /^react($|\/)/,
    /^react-dom($|\/)/,
    "framer-motion",
    "radix-ui",
    "react-hotkeys-hook",
    EXTERNAL_NOTION_KIT,
  ],
}));
