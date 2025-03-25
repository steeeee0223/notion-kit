import type { RegistryIndex } from "@notion-kit/validators";

import { base as _base } from "@/registry/registry-base";
import { core as _core } from "@/registry/registry-core";
import { hooks as _hooks } from "@/registry/registry-hooks";
import { iconLibraries } from "@/registry/registry-icons";
import { lib as _lib } from "@/registry/registry-lib";

const base: RegistryIndex = [{ ..._base, type: "base" }];
const core: RegistryIndex = _core.map((item) => ({ ...item, type: "core" }));
const hooks: RegistryIndex = _hooks.map((item) => ({ ...item, type: "hook" }));
const lib: RegistryIndex = _lib.map((item) => ({ ...item, type: "lib" }));
const iconLibs: RegistryIndex = Object.entries(iconLibraries).map(
  ([, value]) =>
    ({
      name: value.name,
      type: "icon-library",
      dependencies: [value.package],
    }) as const,
);

export const registry: RegistryIndex = [
  ...base,
  ...core,
  ...hooks,
  ...lib,
  ...iconLibs,
];
