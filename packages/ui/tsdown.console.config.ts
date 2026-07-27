import { defineConfig } from "tsdown";

export default defineConfig({
  entry: {
    "dom-selector-console": "./src/dom-selector-console.ts",
  },
  clean: false,
  dts: false,
  fixedExtension: false,
  format: "iife",
  globalName: "NotionKitDomSelector",
  minify: true,
  outDir: "dist",
  platform: "browser",
  target: "es2020",
});
