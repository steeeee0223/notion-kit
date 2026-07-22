import path from "node:path";
import MCR from "monocart-coverage-reports";

const appRoot = path.resolve(import.meta.dirname, "..");

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
    "**/_next/static/chunks/packages_table-view_src_*.js": true,
    "**": false,
  },
  sourceFilter: {
    "**/packages/table-view/src/**/*.{ts,tsx}": true,
    "**": false,
  },
  clean: true,
  cleanCache: false,
};
