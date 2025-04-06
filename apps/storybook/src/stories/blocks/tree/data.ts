import type { TreeItemData, TreeNode } from "@notion-kit/tree";

export const folderNodes: TreeNode<TreeItemData>[] = [
  {
    id: "1",
    title: "Folder 1",
    group: "default",
    icon: { type: "lucide", name: "folder" },
    children: [
      {
        parentId: "1",
        id: "1.a",
        title: "Folder A",
        group: "default",
        icon: { type: "lucide", name: "folder" },
        children: [
          {
            parentId: "1.a",
            id: "1.a.1",
            title: "File 1 in folder A",
            group: "default",
            children: [],
          },
        ],
      },
      {
        parentId: "1",
        id: "1.b",
        title: "File B",
        group: "default",
        children: [],
      },
    ],
  },
  {
    id: "2",
    title: "Folder 2",
    group: "default",
    icon: { type: "lucide", name: "folder" },
    children: [
      {
        parentId: "2",
        id: "2.c",
        title: "File C",
        group: "default",
        children: [],
      },
      {
        parentId: "2",
        id: "2.d",
        title: "File D",
        group: "default",
        children: [],
      },
    ],
  },
  {
    id: "3",
    title: "Folder 3",
    group: "default",
    icon: { type: "lucide", name: "folder" },
    children: [],
  },
];

export const folderSystemItems: TreeItemData[] = [
  {
    group: "project",
    id: "test-id-1",
    title: "app",
    parentId: null,
    icon: { type: "lucide", name: "folder" },
  },
  {
    group: "project",
    id: "test-id-2",
    title: "page.tsx",
    parentId: "test-id-1",
  },
  {
    group: "project",
    id: "test-id-3",
    title: "layout.tsx",
    parentId: "test-id-1",
  },
  {
    group: "project",
    id: "test-id-4",
    title: "globals.css",
    parentId: "test-id-1",
  },
  {
    group: "project",
    id: "test-id-5",
    title: "docs",
    parentId: "test-id-1",
    icon: { type: "lucide", name: "folder" },
  },
  {
    group: "project",
    id: "test-id-6",
    title: "page.tsx",
    parentId: "test-id-5",
  },
  {
    group: "project",
    id: "test-id-7",
    title: "package.json",
    parentId: null,
  },
  {
    group: "project",
    id: "test-id-8",
    title: "tsconfig.json",
    parentId: null,
  },
];

export const groupFolderItems: TreeItemData[] = [
  {
    group: "main",
    id: "test-id-1",
    title: "app",
    parentId: null,
    icon: { type: "lucide", name: "folder" },
  },
  {
    group: "main",
    id: "test-id-2",
    title: "page.tsx",
    parentId: "test-id-1",
  },
  {
    group: "main",
    id: "test-id-3",
    title: "layout.tsx",
    parentId: "test-id-1",
  },
  {
    group: "main",
    id: "test-id-4",
    title: "globals.css",
    parentId: "test-id-1",
  },
  {
    group: "main",
    id: "test-id-5",
    title: "docs",
    parentId: "test-id-1",
    icon: { type: "lucide", name: "folder" },
  },
  {
    group: "main",
    id: "test-id-6",
    title: "page.tsx",
    parentId: "test-id-5",
  },
  {
    group: "config",
    id: "test-id-7",
    title: "package.json",
    parentId: null,
    icon: { type: "lucide", name: "settings" },
  },
  {
    group: "config",
    id: "test-id-8",
    title: "tsconfig.json",
    parentId: null,
    icon: { type: "lucide", name: "settings" },
  },
];
