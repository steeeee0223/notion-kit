import path from "path";
import { cosmiconfig } from "cosmiconfig";
import { loadConfig } from "tsconfig-paths";

import {
  ExtendedConfig,
  ExtendedConfigSchema,
  RawConfig,
  RawConfigSchema,
} from "@notion-kit/validators";

import { resolveImport } from "@/lib";

export const DEFAULT_STYLE = "default";
export const DEFAULT_COMPONENTS = "@/components";
export const DEFAULT_UTILS = "@/lib/utils";
export const DEFAULT_TAILWIND_CSS = "app/globals.css";
export const DEFAULT_TAILWIND_CONFIG = "tailwind.config.js";
export const DEFAULT_TAILWIND_BASE_COLOR = "slate";

const explorer = cosmiconfig("config", {
  searchPlaces: ["dotui.json"],
});

export async function getConfig(cwd: string): Promise<ExtendedConfig | null> {
  const configResult = await explorer.search(cwd);

  if (!configResult) {
    throw new Error("Failed to load config.");
  }

  const config = RawConfigSchema.parse(configResult.config);

  return resolveConfigPaths(cwd, config);
}

export function resolveConfigPaths(cwd: string, config: RawConfig) {
  const tsConfig = loadConfig(cwd);

  if (tsConfig.resultType === "failed") {
    throw new Error(
      `Failed to load tsconfig.json. ${tsConfig.message || ""}`.trim(),
    );
  }

  return ExtendedConfigSchema.parse({
    ...config,
    resolvedPaths: {
      cwd,
      css: path.resolve(cwd, config.css),
      core: resolveImport(config.aliases.core, tsConfig),
      components: resolveImport(config.aliases.components, tsConfig),
      hooks: resolveImport(config.aliases.hooks, tsConfig),
      lib: resolveImport(config.aliases.lib, tsConfig),
    },
  }) satisfies ExtendedConfig;
}
