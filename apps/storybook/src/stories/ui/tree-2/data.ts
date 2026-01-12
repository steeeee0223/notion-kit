import { TreeNode } from "@notion-kit/tree-2";
import { TreeItemData } from "@notion-kit/tree-2/presets";

// treeData.ts
export interface Node {
  id: string;
  label: string;
  children?: Node[];
}

export const data: Node[] = [
  {
    id: "1",
    label: "Applications",
    children: [
      { id: "1-1", label: "Calendar" },
      {
        id: "1-2",
        label: "Mail",
        children: [
          { id: "1-2-1", label: "Inbox" },
          { id: "1-2-2", label: "Sent" },
        ],
      },
    ],
  },
  {
    id: "2",
    label: "Documents",
    children: [
      { id: "2-1", label: "Resume.pdf" },
      { id: "2-2", label: "CoverLetter.docx" },
    ],
  },
];

export const folderNodes: TreeNode<TreeItemData>[] = [
  {
    id: "1",
    title: "Folder 1",
    group: "default",
    icon: "F",
    children: [
      {
        parentId: "1",
        id: "1.a",
        title: "Folder A",
        group: "default",
        icon: "F",
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
    icon: "F",
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
    icon: "F",
    children: [],
  },
];
