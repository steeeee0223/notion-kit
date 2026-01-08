import pluginBabel from "@rollup/plugin-babel";
import { defineConfig } from "tsdown";

export default defineConfig((opts) => ({
  ...opts,
  dts: true,
  logLevel: "warn",
  onSuccess: async () => {
    if (opts.watch) {
      console.info("Watching for changes...");
      return;
    }
    console.info("Build successfully!");
  },
}));
