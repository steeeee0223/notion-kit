import { existsSync, promises as fs } from "node:fs";
import path from "path";
import { rimraf } from "rimraf";

import {
  InternalRegistry,
  RegistryIndex,
  RegistryIndexSchema,
  RegistryItemSchema,
  RegistryItemType,
} from "@notion-kit/validators";

import { kebabCaseToCamelCase, kebabCaseToTitleCase } from "@/lib/string";
import { registry } from "@/registry";
import { base } from "@/registry/registry-base";
import { core } from "@/registry/registry-core";
import { hooks } from "@/registry/registry-hooks";
import { iconLibraries } from "@/registry/registry-icons";
import { lib } from "@/registry/registry-lib";

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

  const payload: RegistryIndex = registry.map((item) => ({
    name: item.name,
    type: item.type,
    deps: item.deps,
    registryDeps: item.registryDeps,
    variants: item.variants,
  }));

  RegistryIndexSchema.parse(payload);

  const registryJson = JSON.stringify(payload, null, 2);
  await fs.writeFile(path.join(targetPath, "index.json"), registryJson, "utf8");
};

/**
 * Builds `registry/base.json`.
 * Contains the foundations and required dependencies.
 */
const buildBase = async () => {
  const targetPath = path.join(REGISTRY_PATH, "base.json");
  rimraf.sync(targetPath);

  const payload = { ...base };

  RegistryItemSchema.parse(payload);

  const baseJson = JSON.stringify(payload, null, 2);
  await fs.writeFile(targetPath, baseJson, "utf8");
};

/**
 * Builds `registry/core/index.json`.
 * Contains the list of all core components.
 *
 * Builds `registry/core/[name].json`.
 * Component's infos.
 */
const buildRegistryItems = async (
  type: RegistryItemType,
  registry: InternalRegistry,
  caseTransfer: "title" | "camel",
) => {
  const targetPath = path.join(REGISTRY_PATH, type);
  rimraf.sync(targetPath);
  if (!existsSync(targetPath)) {
    await fs.mkdir(targetPath, { recursive: true });
  }

  const toCase =
    caseTransfer === "title" ? kebabCaseToTitleCase : kebabCaseToCamelCase;
  const allRegistry = registry
    .filter((elem) => {
      if (elem.variants) return true;
      if (elem.name.includes("_")) return false;
      return true;
    })
    .map((item) => ({
      name: item.name,
      type: item.type,
      label: toCase(item.name),
      description: item.description,
    }));

  // Builds `registry/core/index.json`
  RegistryIndexSchema.parse(allRegistry);
  const indexContent = JSON.stringify(allRegistry, null, 2);
  await fs.writeFile(path.join(targetPath, "index.json"), indexContent, "utf8");

  // Builds `registry/core/[name].json`
  for (const item of registry) {
    let files;
    if (item.files.length > 0) {
      files = await Promise.all(
        item.files.map(async (file) => {
          const content = await fs.readFile(
            path.join(process.cwd(), "src", "registry", file.source),
            "utf8",
          );
          return { type: file.type, content, path: file.target };
        }),
      );
    }

    const payload = { ...item, files };

    RegistryItemSchema.parse(payload);

    await fs.writeFile(
      path.join(targetPath, `${item.name}.json`),
      JSON.stringify(payload, null, 2),
      "utf8",
    );
  }
};

/**
 * Builds `registry/icons/index.json`.
 * Contains the list of all icon libraries.
 *
 * Builds `registry/icons/[iconLibrary].json`.
 * Contains the list of all icons in the specified icon library.
 *
 * Builds `__icons__/index.tsx`.
 * Contains all the icons as react components.
 */
const buildIcons = async () => {
  const targetPath = path.join(REGISTRY_PATH, "icons");
  rimraf.sync(targetPath);
  if (!existsSync(targetPath)) {
    await fs.mkdir(targetPath, { recursive: true });
  }

  const payload = Object.entries(iconLibraries).map(([, value]) => ({
    name: value.name,
    type: "icon-library",
    dependencies: [value.package],
  }));

  RegistryIndexSchema.parse(payload);

  /**
   * Builds `registry/icons/index.json`.
   */
  const iconLibrariesJson = JSON.stringify(payload, null, 2);
  await fs.writeFile(
    path.join(targetPath, "index.json"),
    iconLibrariesJson,
    "utf8",
  );
};

const run = async () => {
  try {
    await buildRegistry();
    await buildBase();

    await buildRegistryItems("core", core, "title");
    await buildRegistryItems("hook", hooks, "camel");
    await buildRegistryItems("lib", lib, "title");

    await buildIcons();

    console.log("✅ Done!");
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

void run();
