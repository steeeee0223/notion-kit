import pluginBabel from "@rollup/plugin-babel";
import { defineConfig } from "tsdown";

export default defineConfig((opts) => {
  return [
    {
      ...opts,
      dts: true,
      banner: { js: '"use client";' },
      logLevel: "warn",
      onSuccess: async () => {
        if (opts.watch) {
          console.info("Watching for changes...");
          return;
        }
        console.info("Build successfully!");
      },
      entry: ["src/index.ts"],
      plugins: [
        pluginBabel({
          babelHelpers: "bundled",
          parserOpts: {
            sourceType: "module",
            plugins: ["jsx", "typescript"],
          },
          // plugins: ["babel-plugin-react-compiler"],
          extensions: [".js", ".jsx", ".ts", ".tsx"],
        }),
      ],
    },
  ];
});
