import childProcess from "node:child_process";
import { existsSync, promises as fs } from "node:fs";
import path from "path";
import { rimraf } from "rimraf";

import { RegistryIndexSchema } from "@notion-kit/validators";

import { registry } from "@/registry";

const REGISTRY_PATH = path.join(process.cwd(), "public/registry");

/**
 * Builds `registry/index.json`.
 * Contains the list of all components, hooks, etc.
 */
const buildRegistry = async () => {
  const targetPath = REGISTRY_PATH;
  rimraf.sync(targetPath);
  if (!existsSync(targetPath)) {
    await fs.mkdir(targetPath, { recursive: true });
  }

  const result = RegistryIndexSchema.parse(registry);

  const registryJson = JSON.stringify(result, null, 2);
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
