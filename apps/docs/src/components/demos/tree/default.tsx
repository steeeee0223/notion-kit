import { TreeList, type TreeItemData, type TreeNode } from "@notion-kit/tree";

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

export default function Default() {
  return (
    <div className="flex w-40 flex-col">
      <TreeList
        nodes={folderNodes}
        defaultIcon={{ type: "lucide", name: "file-text" }}
        showEmptyChild
      />
    </div>
  );
}
