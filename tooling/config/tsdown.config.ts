import { defineConfig } from "tsdown";

export default defineConfig((opts) => {
  return [
    {
      ...opts,
      dts: true,
      platform: "browser",
      outExtensions: () => {
        return {
          js: ".mjs",
          dts: ".mts",
        };
      },
      external: [/@notion-kit\/.+/, "react", "react/jsx-runtime"],
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
    },
  ];
});
