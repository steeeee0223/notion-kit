import type { IconInfo } from "@notion-kit/icon-block";

export interface TreeItemData {
  id: string;
  title: string;
  parentId?: string | null;
  group?: string | null;
  icon?: IconInfo | null;
}

export type TreeNode<T extends TreeItemData> = T & { children: TreeNode<T>[] };

export function fromNode<T extends TreeItemData>(node: TreeNode<T>) {
  const { children: _unused, ...item } = node;
  return item as unknown as T;
}
