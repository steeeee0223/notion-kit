import pluginBabel from "@rollup/plugin-babel";
import type { InlineConfig, UserConfig } from "tsdown";

export const baseConfig = (config: InlineConfig): UserConfig => {
  return {
    ...config,
    dts: true,
    logLevel: "warn",
    onSuccess: async () => {
      if (config.watch) {
        console.info("Watching for changes...");
        return;
      }
      console.info("Build successfully!");
    },
  };
};

export const withReactClient = (config: InlineConfig): UserConfig => {
  return {
    ...config,
    ...baseConfig(config),
    banner: { js: '"use client";' },
  };
};

export const withReactCompiler = (config: InlineConfig): UserConfig => {
  return {
    ...config,
    ...withReactClient(config),
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
};
