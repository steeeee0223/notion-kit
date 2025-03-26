import type { TreeItemData, TreeNode } from "./types";

export function buildTree<T extends TreeItemData>(
  items: T[],
  rootId?: string | null,
): TreeNode<T>[] {
  const lookup: Record<string, TreeNode<T>> = Object.fromEntries(
    items.map((item) => [item.id, { ...item, children: [] }]),
  );

  // Build tree structure
  items.forEach((item) => {
    if (item.parentId) lookup[item.parentId]?.children.push(lookup[item.id]!);
  });

  // Return the children of the rootId, or all root nodes if rootId is null/undefined
  return rootId
    ? (lookup[rootId]?.children ?? [])
    : items.filter((item) => !item.parentId).map((item) => lookup[item.id]!);
}

export function fromNode<T extends TreeItemData>(node: TreeNode<T>) {
  const { children: _unused, ...item } = node;
  return item as unknown as T;
}
