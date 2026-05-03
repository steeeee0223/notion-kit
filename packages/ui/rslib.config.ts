import { pluginBabel } from "@rsbuild/plugin-babel";
import { pluginReact } from "@rsbuild/plugin-react";
import { defineConfig } from "@rslib/core";

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

export default defineConfig({
  plugins: [
    pluginReact(),
    pluginBabel({
      babelLoaderOptions: (opts) => {
        opts.plugins ??= [];
        opts.plugins.push("babel-plugin-react-compiler");
      },
    }),
  ],
  source: {
    entry: {
      "primitives/index": "./src/primitives/index.ts",
      "icons/index": "./src/icons/index.ts",
      "i18n/index": "./src/i18n/index.ts",
      "common/index": "./src/common/index.ts",
      "icon-block/index": "./src/icon-block/index.ts",
      "icon-menu/index": "./src/icon-menu/index.ts",
      "tags-input/index": "./src/tags-input/index.ts",
      "single-image-dropzone/index": "./src/single-image-dropzone/index.ts",
      "unsplash/index": "./src/unsplash/index.ts",
      "cover/index": "./src/cover/index.ts",
      "navbar/index": "./src/navbar/index.ts",
      "navbar/presets/index": "./src/navbar/presets/index.ts",
      "sidebar/index": "./src/sidebar/index.ts",
      "sidebar/presets/index": "./src/sidebar/presets/index.ts",
      "tree/index": "./src/tree/index.ts",
      "tree/presets/index": "./src/tree/presets/index.ts",
      "timeline/index": "./src/timeline/index.ts",
    },
  },
  lib: [
    {
      format: "esm",
      syntax: "es2022",
      dts: { bundle: false },
    },
    {
      format: "cjs",
      syntax: "es2022",
    },
  ],
  output: {
    target: "node",
    externals: [
      /^react($|\/)/,
      /^react-dom($|\/)/,
      /^zod($|\/)/,
      EXTERNAL_NOTION_KIT,
      ...THIRD_PARTY,
    ],
  },
});
