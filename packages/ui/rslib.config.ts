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
