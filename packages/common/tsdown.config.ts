import { readdir } from "node:fs/promises";
import { defineConfig } from "tsdown";

import { withReactCompiler } from "@notion-kit/config/tsdown";

export default defineConfig(async (opts) => {
  // Automatically discover all source files except index.ts
  const files = await readdir("./src");
  const entries = files
    .filter((file) => file !== "index.ts" && /\.(ts|tsx)$/.test(file))
    .map((file) => `./src/${file}`);

  return {
    ...opts,
    entry: entries,
    ...withReactCompiler(opts),
  };
});
