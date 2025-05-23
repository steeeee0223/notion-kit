import {
  RegistryItemTypeSchema,
  type RegistryItem,
} from "@notion-kit/validators";

import { getFilePath } from "@/lib/get-file-source";

export const core = [
  {
    name: "button",
    title: "Button",
    files: [
      {
        type: RegistryItemTypeSchema.Enum["registry:component"],
        path: getFilePath("shadcn/src/button.tsx"),
        target: "core/button.tsx",
      },
      {
        type: RegistryItemTypeSchema.Enum["registry:component"],
        path: getFilePath("shadcn/src/variants.ts"),
        target: "core/variants.ts",
      },
    ],
    dependencies: ["@radix-ui/react-slot", "class-variance-authority"],
  },
].map<RegistryItem>((item) => ({
  $schema: "https://ui.shadcn.com/schema/registry-item.json",
  type: "registry:component",
  ...item,
}));
