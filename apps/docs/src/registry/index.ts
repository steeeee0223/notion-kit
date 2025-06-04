import type { RegistryIndex } from "@notion-kit/validators";

import { core } from "./core";
import { theme } from "./theme";

export const registry = {
  $schema: "https://ui.shadcn.com/schema/registry.json",
  name: "notion-ui",
  homepage: "https://notion-ui.vercel.app/",
  items: [theme, ...core],
} satisfies RegistryIndex;
