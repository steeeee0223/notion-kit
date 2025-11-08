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
      external: [/@notion-kit\/.+/],
      // 只在 ESM 格式加 "use client"
      banner: ({ format }) => {
        if (format === "esm") {
          return { js: '"use client";' };
        }
        return {};
      },
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
