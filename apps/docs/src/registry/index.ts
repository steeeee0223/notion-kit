import type { RegistryIndex } from "@notion-kit/validators";

import { core } from "@/registry/core";

export const registry = {
  $schema: "https://ui.shadcn.com/schema/registry.json",
  name: "notion-ui",
  homepage: "",
  items: [...core],
} satisfies RegistryIndex;
