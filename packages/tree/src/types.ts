import type { IconInfo } from "@notion-kit/icon-block";

export interface TreeItemData {
  id: string;
  title: string;
  parentId?: string | null;
  group?: string | null;
  icon?: IconInfo | null;
}

export type TreeNode<T extends TreeItemData> = T & { children: TreeNode<T>[] };
