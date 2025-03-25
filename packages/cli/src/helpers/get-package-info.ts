import path from "path";
import fs from "fs-extra";
import { type PackageJson } from "type-fest";

export function getPackageJson(
  cwd = "",
  shouldThrow = true,
): PackageJson | null {
  const packageJsonPath = path.join(cwd, "package.json");

  return fs.readJSONSync(packageJsonPath, {
    throws: shouldThrow,
  }) as PackageJson;
}
