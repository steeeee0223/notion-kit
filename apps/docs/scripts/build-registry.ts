import childProcess from "node:child_process";
import { existsSync, promises as fs } from "node:fs";
import path from "path";
import { rimraf } from "rimraf";

import type { RegistryItem } from "@notion-kit/validators";
import { RegistryIndexSchema } from "@notion-kit/validators";

import { getRegistryPath } from "@/lib/get-file-source";
import { DEMOS } from "@/registry/demos";
import { theme } from "@/registry/theme";

const REGISTRY_PATH = path.join(process.cwd(), "public/registry");
const REGISTRY_SRC_PATH = path.join(
  process.cwd(),
  "../../packages/registry/src",
);

function toTitle(name: string): string {
  return name
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

async function discoverFiles(demoName: string): Promise<string[]> {
  const demoDir = path.join(REGISTRY_SRC_PATH, demoName);
  const entries = await fs.readdir(demoDir);
  return entries.filter((file) => file !== "index.ts");
}

async function buildDemoItems(): Promise<RegistryItem[]> {
  const items: RegistryItem[] = [];

  for (const name of DEMOS) {
    const files = await discoverFiles(name);

    items.push({
      $schema: "https://ui.shadcn.com/schema/registry-item.json",
      name,
      title: toTitle(name),
      type: "registry:component",
      files: files.map((file) => ({
        type: "registry:component",
        path: path.join(REGISTRY_SRC_PATH, name, file),
        target: `components/${name}/${file}`,
      })),
      registryDependencies: [getRegistryPath("notion-theme")],
    });
  }

  return items;
}

const buildRegistry = async () => {
  const targetPath = REGISTRY_PATH;
  rimraf.sync(targetPath);
  if (!existsSync(targetPath)) {
    await fs.mkdir(targetPath, { recursive: true });
  }

  const items = await buildDemoItems();

  const registry = RegistryIndexSchema.parse({
    $schema: "https://ui.shadcn.com/schema/registry.json",
    name: "notion-ui",
    homepage: "https://notion-ui.vercel.app/",
    items: [theme, ...items],
  });

  const registryJson = JSON.stringify(registry, null, 2);
  await fs.writeFile(path.join(targetPath, "index.json"), registryJson, "utf8");

  childProcess.execSync(
    `pnpx shadcn@latest build ${targetPath}/index.json --output ${targetPath}`,
  );
};

const run = async () => {
  try {
    await buildRegistry();
    console.log("✅ Done!");
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
};

void run();
