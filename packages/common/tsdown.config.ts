import { readdir } from "node:fs/promises";
import pluginBabel from "@rollup/plugin-babel";
import { defineConfig } from "tsdown";

export default defineConfig(async (opts) => {
  // Automatically discover all source files except index.ts
  const files = await readdir("./src");
  const entries = files
    .filter((file) => file !== "index.ts" && /\.(ts|tsx)$/.test(file))
    .map((file) => `./src/${file}`);

  return {
    ...opts,
    entry: entries,
    banner: { js: '"use client";' },
    dts: true,
    logLevel: "warn",
    onSuccess: async () => {
      if (opts.watch) {
        console.info("Watching for changes...");
        return;
      }
      console.info("Build successfully!");
    },
    plugins: [
      pluginBabel({
        babelHelpers: "bundled",
        parserOpts: {
          sourceType: "module",
          plugins: ["jsx", "typescript"],
        },
        plugins: ["babel-plugin-react-compiler"],
        extensions: [".js", ".jsx", ".ts", ".tsx"],
      }),
    ],
  };
});
