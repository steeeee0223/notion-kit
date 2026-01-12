import type { TreeEntity, TreeInstance, TreeItemData, TreeNode } from "./types";

export function buildTree<T extends TreeItemData>(
  nodes: TreeNode<T>[],
  expanded: Set<string>,
  _parentId: string | null = null,
  level = 1,
  acc: TreeEntity<T> = {
    visibleIds: [],
    flatIds: [],
    nodes: new Map(),
  },
) {
  for (const node of nodes) {
    const { children, ...data } = node;
    const childIds = children.map((c) => c.id);

    acc.visibleIds.push(node.id);
    acc.flatIds.push(node.id);
    acc.nodes.set(node.id, {
      ...(data as unknown as T),
      level,
      children: childIds,
    });

    if (children.length > 0 && expanded.has(node.id)) {
      buildTree(children, expanded, node.id, level + 1, acc);
    }
  }
  return acc;
}

export function createTreeNavigation<T extends TreeItemData>(
  id: string,
  tree: TreeInstance<T>,
) {
  const { entity, state, expand, focusItem } = tree;

  const index = entity.visibleIds.indexOf(id);

  // Helper to find parent by checking which node has this id in its children
  const findParent = (nodeId: string): string | null => {
    for (const [parentId, node] of entity.nodes.entries()) {
      if (node.children.includes(nodeId)) return parentId;
    }
    return null;
  };

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
          const node = entity.nodes.get(id);
          const firstChild = node?.children[0];

          if (!state.expanded.has(id)) {
            expand(id);
          } else if (firstChild) {
            focusItem(firstChild);
          }
          break;
        }

        case "ArrowLeft": {
          e.preventDefault();
          if (state.expanded.has(id)) {
            expand(id);
          } else {
            const parent = findParent(id);
            if (parent) focusItem(parent);
          }
          break;
        }
      }
    },
  };
}
