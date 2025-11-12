import { defineConfig } from "tsup";

export default defineConfig((opts) => {
  return [
    {
      ...opts,
      config: "@notion-kit/config/tsup",
      external: undefined,
      entry: ["src/index.ts"],
    },
  ];
});
