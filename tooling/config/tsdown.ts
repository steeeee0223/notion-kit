import pluginBabel from "@rollup/plugin-babel";
import type { InlineConfig } from "tsdown";

export function baseConfig(config: InlineConfig) {
  return {
    dts: true,
    logLevel: "warn",
    onSuccess: async () => {
      if (config.watch) {
        console.info("Watching for changes...");
        return;
      }
      console.info("Build successfully!");
    },
    ...config,
  };
}

export function withReactClient(config: InlineConfig) {
  return {
    banner: { js: '"use client";' },
    ...baseConfig(config),
  };
}

export function withReactCompiler(config: InlineConfig) {
  return {
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
    ...withReactClient(config),
  };
}
