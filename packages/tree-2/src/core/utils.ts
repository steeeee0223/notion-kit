import type { TreeInstance } from "./types";

export function createTreeNavigation(id: string, tree: TreeInstance) {
  const { indexes, expanded, expand, focusItem } = tree;

  const index = indexes.visibleIds.indexOf(id);

  return {
    onKeyDown: (e: React.KeyboardEvent) => {
      switch (e.key) {
        case "ArrowDown": {
          e.preventDefault();
          const next = indexes.visibleIds[index + 1];
          if (next) focusItem(next);
          break;
        }

        case "ArrowUp": {
          e.preventDefault();
          const prev = indexes.visibleIds[index - 1];
          if (prev) focusItem(prev);
          break;
        }

        case "ArrowRight": {
          e.preventDefault();
          const firstChild = indexes.childrenMap.get(id)?.[0];
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
            const parent = indexes.parentMap.get(id);
            if (parent) focusItem(parent);
          }
          break;
        }
      }
    },
  };
}
