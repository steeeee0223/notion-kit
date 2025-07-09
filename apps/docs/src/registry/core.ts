import path from "path";

import {
  RegistryItemTypeSchema,
  type RegistryItem,
} from "@notion-kit/validators";

import { getRegistryPath } from "@/lib/get-file-source";

export const core = [
  {
    name: "notion-ui",
    title: "Notion UI",
    filePath: "components/core/notion-ui.tsx",
    dependencies: [
      "@notion-kit/shadcn",
      "@notion-kit/single-image-dropzone",
      "@notion-kit/spinner",
      "@notion-kit/tags-input",
      "@notion-kit/tree",
    ],
  },
  {
    name: "icons",
    title: "Icons",
    filePath: "components/core/icons.tsx",
    dependencies: ["@notion-kit/icons"],
  },
  {
    name: "blocks",
    title: "Blocks",
    filePath: "components/core/blocks.tsx",
    dependencies: [
      "@notion-kit/cover",
      "@notion-kit/icon-block",
      "@notion-kit/icon-menu",
      "@notion-kit/modal",
    ],
  },
  {
    name: "navbar",
    title: "Navbar",
    filePath: "components/core/navbar.tsx",
    dependencies: [
      "@notion-kit/icons",
      "@notion-kit/navbar",
      "@notion-kit/schemas",
    ],
  },
  {
    name: "sidebar",
    title: "Sidebar",
    filePath: "components/core/sidebar.tsx",
    dependencies: ["@notion-kit/sidebar"],
  },
  {
    name: "settings-panel",
    title: "Settings Panel",
    filePath: "components/core/settings-panel.tsx",
    dependencies: [
      "@notion-kit/settings-panel",
      "@notion-kit/icons",
      "@notion-kit/shadcn",
    ],
  },
  {
    name: "table-view",
    title: "Settings Panel",
    filePath: "components/core/table-view.tsx",
    dependencies: ["@notion-kit/table-view"],
  },
  {
    name: "auth-ui",
    title: "Auth UI",
    filePath: "components/core/auth-ui.tsx",
    dependencies: ["@notion-kit/auth-ui"],
  },
].map<RegistryItem>(({ filePath, ...item }) => ({
  $schema: "https://ui.shadcn.com/schema/registry-item.json",
  type: "registry:component",
  ...item,
  files: [
    {
      type: RegistryItemTypeSchema.Enum["registry:component"],
      path: path.join(process.cwd(), "src", filePath),
      target: filePath,
    },
  ],
  registryDependencies: [getRegistryPath("notion-theme")],
}));
