import * as fs from "node:fs";
import * as path from "node:path";

interface RawNotionIcon {
  dark: Record<string, string>;
  light: Record<string, string>;
  tooltip: string;
  tags: string[];
}

interface ProcessedIcon {
  id: string;
  name: string;
  pathData: string;
  tags: string[];
}

function extractPathD(svgString: string): string {
  const match = / d="([^"]+)"/.exec(svgString);
  return match?.[1] ?? "";
}

/**
 * Script to fetch Notion icons from the API and generate a static JSON file.
 *
 * Usage: npx tsx scripts/fetch-notion-icons.ts
 *
 * This bypasses CORS since it runs in Node.js,
 * producing a pre-processed JSON file for the factory to lazy-load.
 */
async function main() {
  console.log("Fetching Notion icons from https://www.notion.so/icons/all ...");

  const response = await fetch("https://www.notion.so/icons/all");
  if (!response.ok) {
    throw new Error(
      `Failed to fetch: ${response.status} ${response.statusText}`,
    );
  }

  const data = (await response.json()) as Record<string, RawNotionIcon>;
  console.log(`Received ${Object.keys(data).length} icons`);

  const icons: ProcessedIcon[] = [];
  for (const [id, entry] of Object.entries(data)) {
    // Extract path data from the gray variant of dark theme
    const svgString = entry.dark.gray;
    if (!svgString) {
      console.warn(`  Skipping ${id}: no svg string found`);
      continue;
    }
    const pathData = extractPathD(svgString);
    if (!pathData) {
      console.warn(`  Skipping ${id}: no path data found`);
      continue;
    }
    icons.push({
      id,
      name: entry.tooltip,
      pathData,
      tags: entry.tags,
    });
  }

  console.log(
    `Processed ${icons.length} icons (${Object.keys(data).length - icons.length} skipped)`,
  );

  const outPath = path.resolve(
    import.meta.dirname,
    "../src/factories/notion-icons/notion-icons-data.json",
  );
  fs.writeFileSync(outPath, JSON.stringify(icons, null, 2), "utf-8");
  console.log(`Written to ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
