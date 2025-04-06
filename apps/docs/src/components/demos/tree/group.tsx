"use client";

import { useState } from "react";
import { v4 } from "uuid";

import {
  TreeGroup,
  TreeList,
  type TreeItemData,
  type TreeNode,
} from "@notion-kit/tree";

const folderNodes: TreeNode<TreeItemData>[] = [
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

export default function Group() {
  const [activeFile, setActiveFile] = useState<string | null>(null);
  const [nodes, setNodes] = useState(folderNodes);
  const addFile = () =>
    setNodes((prev) => [
      ...prev,
      { id: v4(), title: "New File", children: [] },
    ]);

  return (
    <TreeGroup
      className="w-60 bg-sidebar p-2"
      title="Workspace"
      description="Add a file"
      onCreate={addFile}
    >
      <TreeList
        nodes={nodes}
        defaultIcon={{ type: "lucide", name: "file-text" }}
        selectedId={activeFile}
        onSelect={setActiveFile}
        showEmptyChild
      />
    </TreeGroup>
  );
}
