import { defineConfig } from "tsdown";

export default defineConfig((opts) => {
  return [
    {
      ...opts,
      dts: true,
      treeshake: true,
      sourcemap: true,
      external: [/@notion-kit\/.+/],
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
