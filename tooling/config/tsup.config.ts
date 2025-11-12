import { defineConfig } from "tsup";

const silent = false;

export default defineConfig((opts) => {
  return [
    {
      ...opts,
      clean: true,
      dts: true,
      format: ["cjs", "esm"],
      sourcemap: true,
      splitting: false,
      ...(silent
        ? {
            silent: true,
            onSuccess: async () => {
              if (opts.watch) {
                console.info("Watching for changes...");

                return;
              }

              console.info("Build succeeded!");
            },
          }
        : {}),
      entry: ["src/index.ts"],
    },
  ];
});
