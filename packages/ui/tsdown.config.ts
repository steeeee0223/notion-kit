import { defineConfig } from "tsdown";

import { withReactCompiler } from "@notion-kit/config/tsdown";

const EXTERNAL_NOTION_KIT = /^@notion-kit\/(cn|utils|hooks|schemas|auth)/;

const THIRD_PARTY = [
  /^@better-fetch\//,
  /^@dnd-kit\//,
  /^@emoji-mart\//,
  /^@headless-tree\//,
  /^@hookform\//,
  /^@radix-ui\//,
  /^@tanstack\//,
  /^@uidotdev\//,
  "cmdk",
  "date-fns",
  "i18next",
  "jotai",
  /^lodash\./,
  "lucide-react",
  "next-themes",
  "radix-ui",
  "react-day-picker",
  "react-dropzone",
  "react-hook-form",
  "react-i18next",
  "react-resizable-panels",
  "sonner",
  "unsplash-js",
  "usehooks-ts",
  "vaul",
];

export default defineConfig((opts) => ({
  ...opts,
  ...withReactCompiler(opts),
  entry: {
    "alert-modal/index": "./src/alert-modal/index.tsx",
    "cover/index": "./src/cover/index.ts",
    "icon-block/index": "./src/icon-block/index.ts",
    "icon-menu/index": "./src/icon-menu/index.ts",
    "learning-steps-dialog/index": "./src/learning-steps-dialog/index.tsx",
    "navbar/index": "./src/navbar/index.ts",
    "navbar/presets/index": "./src/navbar/presets/index.ts",
    "primitives/index": "./src/primitives/index.ts",
    "sidebar/index": "./src/sidebar/index.ts",
    "sidebar/presets/index": "./src/sidebar/presets/index.ts",
    "single-image-dropzone/index": "./src/single-image-dropzone/index.ts",
    "tags-input/index": "./src/tags-input/index.ts",
    "timeline/index": "./src/timeline/index.ts",
    "timezone-menu/index": "./src/timezone-menu/index.tsx",
    "tree/index": "./src/tree/index.ts",
    "tree/presets/index": "./src/tree/presets/index.ts",
    "unsplash/index": "./src/unsplash/index.ts",
  },
  external: [
    /^react($|\/)/,
    /^react-dom($|\/)/,
    /^zod($|\/)/,
    EXTERNAL_NOTION_KIT,
    ...THIRD_PARTY,
  ],
}));
