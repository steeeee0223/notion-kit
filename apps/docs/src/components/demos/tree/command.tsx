"use client";

import { useTree } from "@notion-kit/tree";
import { CommandTree, type TreeItemData } from "@notion-kit/tree/presets";

export const folderNodes: TreeItemData[] = [
  {
    id: "1",
    parentId: null,
    title: "Folder 1",
    group: "default",
    icon: "F",
  },
  {
    id: "1.a",
    parentId: "1",
    title: "Folder A",
    group: "default",
    icon: "F",
  },
  {
    id: "1.a.1",
    parentId: "1.a",
    title: "File 1 in folder A",
    group: "default",
  },
  {
    id: "1.b",
    parentId: "1",
    title: "File B",
    group: "default",
  },
  {
    id: "2",
    parentId: null,
    title: "Folder 2",
    group: "default",
    icon: "F",
  },
  {
    id: "2.c",
    parentId: "2",
    title: "File C",
    group: "default",
  },
  {
    id: "2.d",
    parentId: "2",
    title: "File D",
    group: "default",
  },
  {
    id: "3",
    parentId: null,
    title: "Folder 3",
    group: "default",
    icon: "F",
  },
];

export default function Command() {
  const tree = useTree(folderNodes, {});

  return (
    <div className="w-40">
      <CommandTree tree={tree} />
    </div>
  );
}
