import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

import { registryIndex } from "@notion-kit/registry";
import type { RegistryItem } from "@notion-kit/validators";
import { RegistryIndexSchema } from "@notion-kit/validators";

import { theme } from "@/registry/theme";

async function getDemoFilesAndDependencies(demoName: string) {
  const directory = path.join("../../packages/registry/src", demoName);
  const files = (await readdir(directory)).filter(
    (file) => file !== "index.ts",
  );
  const dependencies = new Set<string>();

  for (const file of files) {
    const content = await readFile(path.join(directory, file), "utf8");
    for (const match of content.matchAll(/from\s+["']([^"']+)["']/g)) {
      const dependency = match[1];
      if (dependency?.startsWith("@notion-kit/"))
        dependencies.add(dependency.split("/").slice(0, 2).join("/"));
    }
  }

  return { files, dependencies: [...dependencies] };
}

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
