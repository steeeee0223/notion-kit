import { readdir, stat } from "node:fs/promises";
import { defineConfig } from "tsdown";

import { withReactCompiler } from "@notion-kit/config/tsdown";

export default defineConfig(async (opts) => {
  const items = await readdir("./src");
  const entries: string[] = [];

  for (const item of items) {
    const s = await stat(`./src/${item}`);
    if (s.isDirectory()) {
      entries.push(`./src/${item}/index.ts`);
    } else if (item !== "index.ts" && /\.(ts|tsx)$/.test(item)) {
      entries.push(`./src/${item}`);
    }
  }

  return {
    ...opts,
    entry: entries,
    ...withReactCompiler(opts),
  };
});
