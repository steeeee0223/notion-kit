import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

import type { RegistryItem } from "@notion-kit/validators";
import { RegistryIndexSchema } from "@notion-kit/validators";

import { registryIndex } from "../../../packages/registry/src/index";
import { getDemoFilesAndDependencies } from "../src/lib/registry";
import { theme } from "../src/registry/theme";

const output = "public/registry";
const items: RegistryItem[] = [theme];

for (const name of registryIndex) {
  const { files, dependencies } = await getDemoFilesAndDependencies(name);
  items.push({
    $schema: "https://ui.shadcn.com/schema/registry-item.json",
    name,
    title: name
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" "),
    type: "registry:component",
    dependencies,
    registryDependencies: [
      "https://notion-ui.vercel.app/registry/notion-theme.json",
    ],
    files: files.map((file) => ({
      type: "registry:component",
      path: `components/${name}/${file}`,
      target: `components/${name}/${file}`,
    })),
  });
}

const registry = RegistryIndexSchema.parse({
  $schema: "https://ui.shadcn.com/schema/registry.json",
  name: "notion-ui",
  homepage: "https://notion-ui.vercel.app/",
  items,
});

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
await writeFile(
  path.join(output, "index.json"),
  JSON.stringify(registry, null, 2),
);
for (const item of registry.items) {
  const files = await Promise.all(
    item.files.map(async (file) => ({
      ...file,
      content: await readFile(
        path.join(
          "../../packages/registry/src",
          item.name,
          path.basename(file.path),
        ),
        "utf8",
      ),
    })),
  );
  await writeFile(
    path.join(output, `${item.name}.json`),
    JSON.stringify({ ...item, files }, null, 2),
  );
}
console.log(`Built ${registry.items.length} installable registry items.`);
