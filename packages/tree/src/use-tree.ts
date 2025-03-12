"use client";

import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";

import type { TreeItemData, TreeNode } from "./types";

interface TreeProps<T extends TreeItemData> {
  items: T[];
  selectedId: string | null;
}

interface TreeState<T extends TreeItemData> extends TreeProps<T> {
  select: (id: string | null) => void;
  getNodes: <T extends TreeItemData>(group?: string | null) => TreeNode<T>[];
  set: <T extends TreeItemData>(items: T[]) => void;
  add: <T extends TreeItemData>(item: T) => void;
  delete: (itemId: string) => void;
}

const useTreeBase = create<TreeState<TreeItemData>>()((set, get) => ({
  items: [],
  selectedId: null,
  select: (id) => set({ selectedId: id }),
  getNodes: <T extends TreeItemData>(group?: string | null) => {
    const items = (() => {
      const __items = get().items;
      return group ? __items.filter((item) => item.group === group) : __items;
    })();
    return buildTree(items as T[]);
  },
  set: (items) => set({ items }),
  add: (item) => set(({ items }) => ({ items: [...items, item] })),
  delete: (itemId) =>
    set(({ items }) => ({
      items: items.filter((item) => item.id !== itemId),
    })),
}));

export const useTree = <U>(selector: (state: TreeState<TreeItemData>) => U) =>
  useTreeBase(useShallow(selector));

export const buildTree = <T extends TreeItemData>(
  items: T[],
  rootId?: string | null,
): TreeNode<T>[] => {
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
};
