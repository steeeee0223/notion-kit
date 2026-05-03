import { pluginBabel } from "@rsbuild/plugin-babel";
import { pluginReact } from "@rsbuild/plugin-react";
import { defineConfig } from "@rslib/core";

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
  resolve: {
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
});
