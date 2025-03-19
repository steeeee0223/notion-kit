import { InternalRegistryItem } from "@notion-kit/validators";

export const base: InternalRegistryItem = {
  name: "base",
  type: "base",
  deps: ["@notion-kit/cn"],
  registryDeps: ["utils"],
  files: [],
};
