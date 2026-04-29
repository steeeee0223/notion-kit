import { promises as fs } from "node:fs";
import path from "node:path";

const REGISTRY_SRC_PATH = path.join(
  process.cwd(),
  "../../packages/registry/src",
);

export async function discoverFiles(demoName: string) {
  const demoDir = path.join(REGISTRY_SRC_PATH, demoName);
  const entries = await fs.readdir(demoDir);
  return entries.filter((file) => file !== "index.ts");
}

export async function getDemoFilesAndDependencies(demoName: string) {
  const files = await discoverFiles(demoName);
  const dependencies = new Set<string>();

  for (const file of files) {
    const filePath = path.join(REGISTRY_SRC_PATH, demoName, file);
    const content = await fs.readFile(filePath, "utf8");

    // Match import statements: import ... from "pkg-name"
    const importRegex = /from\s+["']([^"']+)["']/g;
    let match;
    while ((match = importRegex.exec(content)) !== null) {
      const pkg = match[1];
      if (!pkg) continue;

      // Include @notion-kit/* dependencies except for standard React or local imports
      if (pkg.startsWith("@notion-kit/")) {
        const parts = pkg.split("/");
        const dep = parts.length > 2 ? parts.slice(0, 2).join("/") : pkg;
        dependencies.add(dep);
      } else if (
        !pkg.startsWith(".") &&
        !pkg.startsWith("@/") &&
        !pkg.startsWith("react")
      ) {
        // Optionally include other bare dependencies like lucide-react if needed
        // dependencies.add(pkg);
      }
    }
  }

  return { files, dependencies: Array.from(dependencies) };
}
