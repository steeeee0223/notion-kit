import type { TreeEntity, TreeInstance, TreeItemData, TreeNode } from "./types";

export function buildTree<T extends TreeItemData>(
  nodes: TreeNode<T>[],
  expanded: Set<string>,
  level = 1,
  acc: TreeEntity<T> = {
    visibleIds: [],
    flatIds: [],
    nodes: new Map(),
  },
  isVisible = true,
) {
  for (const node of nodes) {
    const { children, ...data } = node;
    const childIds = children.map((c) => c.id);

    // Always add to flatIds and nodes (full tree)
    acc.flatIds.push(node.id);
    acc.nodes.set(node.id, {
      ...(data as unknown as T),
      level,
      children: childIds,
    });

    // Only add to visibleIds if this node is visible
    if (isVisible) {
      acc.visibleIds.push(node.id);
    }

    // Always recurse for all children (to build full tree)
    // but children are only visible if this node is both visible and expanded
    if (children.length > 0) {
      const childrenVisible = isVisible && expanded.has(node.id);
      buildTree(children, expanded, level + 1, acc, childrenVisible);
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
