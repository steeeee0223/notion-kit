import { spinner as spinner_ } from "@clack/prompts";
import {
  createMatchPath,
  type ConfigLoaderSuccessResult,
} from "tsconfig-paths";

export function spinner() {
  return spinner_();
}

export function isUrl(path: string) {
  try {
    new URL(path);
    return true;
  } catch {
    return false;
  }
}

export function resolveImport(
  importPath: string,
  config: Pick<ConfigLoaderSuccessResult, "absoluteBaseUrl" | "paths">,
) {
  return createMatchPath(config.absoluteBaseUrl, config.paths)(
    importPath,
    undefined,
    () => true,
    [".ts", ".tsx"],
  );
}
