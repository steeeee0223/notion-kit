import pluginBabel from "@rollup/plugin-babel";
import { defineConfig } from "tsdown";

export default defineConfig((opts) => ({
  ...opts,
  entry: ["./src/core/index.ts", "./src/presets/index.ts"],
  banner: { js: '"use client";' },
  dts: true,
  logLevel: "warn",
  external: [/^@dnd-kit\//],
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
}));
