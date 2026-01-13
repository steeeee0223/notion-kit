import type { TreeEntity, TreeInstance, TreeItemData } from "./types";

export function buildTree<T extends TreeItemData>(
  data: T[],
  _expanded: Set<string>,
): TreeEntity<T> {
  const entity: TreeEntity<T> = {
    rootIds: [],
    flatIds: [],
    nodes: new Map(),
  };

  if (data.length === 0) return entity;

  // First pass: Create lookup map and build parent->children mapping
  const dataMap = new Map<string, T>();
  const childrenMap = new Map<string, string[]>();

  data.forEach((item) => {
    entity.flatIds.push(item.id);
    dataMap.set(item.id, item);

    // Initialize children array for this node
    if (!childrenMap.has(item.id)) {
      childrenMap.set(item.id, []);
    }

    // Add this node to its parent's children
    if (item.parentId) {
      if (!childrenMap.has(item.parentId)) {
        childrenMap.set(item.parentId, []);
      }
      childrenMap.get(item.parentId)!.push(item.id);
    } else {
      // This is a root node
      entity.rootIds.push(item.id);
    }
  });

  // Second pass: Calculate levels using BFS
  const queue: { id: string; level: number }[] = [];

  // Start with root nodes
  entity.rootIds.forEach((id) => {
    queue.push({ id, level: 1 });
  });

  while (queue.length > 0) {
    const { id, level } = queue.shift()!;
    const item = dataMap.get(id)!; // O(1) lookup
    const children = childrenMap.get(id) ?? [];

    // Store node with computed metadata
    entity.nodes.set(id, { ...item, level, children });

    // Queue children for level calculation
    children.forEach((childId) =>
      queue.push({ id: childId, level: level + 1 }),
    );
  }

  return entity;
}

export function createTreeNavigation<T extends TreeItemData>(
  id: string,
  tree: TreeInstance<T>,
) {
  const { entity, state, expand, focusItem, getVisibleIds } = tree;

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
          const visibleIds = getVisibleIds();
          const index = visibleIds.indexOf(id);
          const next = visibleIds[index + 1];
          if (next) focusItem(next);
          break;
        }

        case "ArrowUp": {
          e.preventDefault();
          const visibleIds = getVisibleIds();
          const index = visibleIds.indexOf(id);
          const prev = visibleIds[index - 1];
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
