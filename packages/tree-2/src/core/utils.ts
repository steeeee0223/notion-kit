import type { TreeEntity, TreeInstance, TreeItemData, TreeNode } from "./types";

export function buildTree<T extends TreeItemData>(
  nodes: TreeNode<T>[],
  expanded: Set<string>,
  parentId: string | null = null,
  acc: TreeEntity<T> = {
    visibleIds: [],
    nodes: new Map(),
    parentMap: new Map(),
    childrenMap: new Map(),
  },
) {
  for (const node of nodes) {
    const { children, ...data } = node;
    acc.visibleIds.push(node.id);
    acc.nodes.set(node.id, data as unknown as T);
    acc.parentMap.set(node.id, parentId);
    acc.childrenMap.set(
      node.id,
      children.map((c) => c.id),
    );

    if (children.length > 0 && expanded.has(node.id)) {
      buildTree(children, expanded, node.id, acc);
    }
  }
  return acc;
}

export function createTreeNavigation<T extends TreeItemData>(
  id: string,
  tree: TreeInstance<T>,
) {
  const { entity, expanded, expand, focusItem } = tree;

  const index = entity.visibleIds.indexOf(id);

  return {
    onKeyDown: (e: React.KeyboardEvent) => {
      switch (e.key) {
        case "ArrowDown": {
          e.preventDefault();
          const next = entity.visibleIds[index + 1];
          if (next) focusItem(next);
          break;
        }

        case "ArrowUp": {
          e.preventDefault();
          const prev = entity.visibleIds[index - 1];
          if (prev) focusItem(prev);
          break;
        }

        case "ArrowRight": {
          e.preventDefault();
          const firstChild = entity.childrenMap.get(id)?.[0];
          if (!firstChild) return;

          if (!expanded.has(id)) {
            expand(id);
          } else {
            focusItem(firstChild);
          }
          break;
        }

        case "ArrowLeft": {
          e.preventDefault();
          if (expanded.has(id)) {
            expand(id);
          } else {
            const parent = entity.parentMap.get(id);
            if (parent) focusItem(parent);
          }
          break;
        }
      }
    },
  };
}
