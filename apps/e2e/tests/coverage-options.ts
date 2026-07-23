import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import remapping from "@ampproject/remapping";
import type { SourceMapInput } from "@ampproject/remapping";
import { encodedMap, FlattenMap } from "@jridgewell/trace-mapping";
import MCR from "monocart-coverage-reports";

const appRoot = path.resolve(import.meta.dirname, "..");
type DefaultSourceMapResolver = (url: string) => Promise<unknown>;

function resolveNestedTableViewMap(source: string) {
  const sourcePath = source.startsWith("file:")
    ? fileURLToPath(source)
    : source;
  if (!sourcePath.includes("/packages/table-view/dist/")) return null;

  const mapPath = `${sourcePath}.map`;
  if (!fs.existsSync(mapPath)) return null;
  const sourceMap: unknown = JSON.parse(fs.readFileSync(mapPath, "utf8"));
  return sourceMap as SourceMapInput;
}

const resolveSourceMap: NonNullable<
  MCR.CoverageReportOptions["sourceMapResolver"]
> = async (url, defaultResolver) => {
  const resolver = defaultResolver as DefaultSourceMapResolver;
  const sourceMap = await resolver(url);
  if (!url.includes("/packages_table-view_dist")) return sourceMap;

  const flattened = encodedMap(
    new FlattenMap(sourceMap as SourceMapInput, url),
  );
  return remapping(flattened, (source, context) => {
    const nestedMap = resolveNestedTableViewMap(source);
    if (nestedMap) context.source = source;
    return nestedMap;
  });
};

export const coverageOptions: MCR.CoverageReportOptions = {
  name: "table-view Playwright coverage",
  baseDir: path.resolve(appRoot, "../.."),
  outputDir: path.resolve(appRoot, "coverage/e2e"),
  reports: [
    ["v8", { outputFile: "index.html" }],
    ["v8-json", { outputFile: "coverage.json" }],
    ["text", { file: "coverage.txt" }],
    "console-details",
  ],
  entryFilter: {
    "**/_next/static/chunks/packages_table-view_dist*.js": true,
    "**": false,
  },
  sourceFilter: {
    "**/packages/table-view/src/**/*.{ts,tsx}": true,
    "**": false,
  },
  sourceMapResolver: resolveSourceMap,
  clean: true,
  cleanCache: false,
};
