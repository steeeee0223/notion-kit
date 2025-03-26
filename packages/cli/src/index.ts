#!/usr/bin/env node
import childProcess from "node:child_process";

function main() {
  const env = process.env.NODE_ENV;
  const [, notionUI, add, ...names] = process.argv;

  if (notionUI !== "notion-ui" || add !== "add" || names.length === 0) {
    console.log("💡 Usage: npx notion-ui add [...components]");
    process.exit(1);
  }

  for (const name of names) {
    try {
      if (!name.trim()) continue;

      const url = new URL(
        `registry/${name}.json`,
        env === "production"
          ? "https://notion-ui.vercel.app"
          : "http://localhost:3000",
      );

      childProcess.execSync(`pnpx shadcn@latest add ${url.toString()}`);
      console.log(`✨ Added: ${name}`);
    } catch (error) {
      console.log(`❌ Error while adding ${name}:`, error);
    }
  }

  console.log("✅ Done!");
}

main();
