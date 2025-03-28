import { existsSync, promises as fs } from "node:fs";
import path from "node:path";
import { rimraf } from "rimraf";

const INTERNAL_REGISTRY_PATH = path.join(process.cwd(), "src/__registry__");
const DEMOS_PATH = "components/demos";

async function setup() {
  const targetPath = INTERNAL_REGISTRY_PATH;
  rimraf.sync(targetPath);
  if (!existsSync(targetPath)) {
    await fs.mkdir(targetPath, { recursive: true });
  }
  const autogeneratedFilePath = path.join(targetPath, ".autogenerated");
  await fs.writeFile(
    autogeneratedFilePath,
    "This directory is autogenerated. Do not edit its contents directly.",
    "utf8",
  );
}

async function buildDemos() {
  const targetPath = INTERNAL_REGISTRY_PATH;

  let index = `// This file is autogenerated by scripts/build-internal-registry.ts
  // Do not edit this file directly.
  import * as React from "react"

  export const Index: Record<
    string,
    {
      files: string[];
      component: React.LazyExoticComponent<React.ComponentType<object>>;
    }
  > = {
  `;

  const sourcePath = path.join(process.cwd(), `src/${DEMOS_PATH}`);
  const folders = await fs.readdir(sourcePath);
  for (const folder of folders) {
    const folderPath = path.join(sourcePath, folder);
    // replace tsx with empty string
    const primitiveName = folder.replace(".tsx", "");
    const demos = await fs.readdir(folderPath);
    for (const demo of demos) {
      const demoName = `${primitiveName}/${demo.replace(".tsx", "")}`;
      const demoPath = `@/${DEMOS_PATH}/${primitiveName}/${demo.replace(".tsx", "")}`;
      index += `
      "${demoName}": {
        files: ["${DEMOS_PATH}/${primitiveName}/${demo}"],
        component: React.lazy(() => import("${demoPath}")),
      },`;
    }
  }

  index += `
}
`;
  rimraf.sync(path.join(targetPath, "demos.tsx"));
  await fs.writeFile(path.join(targetPath, "demos.tsx"), index, "utf8");
}

async function run() {
  try {
    await setup();
    await buildDemos();
    console.log("✅ Done!");
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

void run();
