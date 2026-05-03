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
    alias: {
      "~": "./src",
    },
    entry: {
      "primitives/index": "./src/primitives/index.ts",
      "alert-modal/index": "./src/alert-modal.tsx",
      "colors/index": "./src/colors.ts",
      "learning-steps-dialog/index": "./src/learning-steps-dialog.tsx",
      "timezone-menu/index": "./src/timezone-menu.tsx",
      "url-form/index": "./src/url-form.tsx",
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
      "selectable/index": "./src/selectable/index.ts",
    },
  },
  lib: [
    {
      format: "esm",
      syntax: "es2022",
      bundle: false,
      dts: true,
    },
    {
      format: "cjs",
      syntax: "es2022",
      bundle: false,
    },
  ],
  output: {
    target: "node",
  },
});
