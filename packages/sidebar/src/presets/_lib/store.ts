import type { Page } from "@notion-kit/schemas";

export interface PagesState {
  pages: Record<string, Page & { originalParentId?: string | null }>;
  pageIds: string[];
  active?: string | null;
}

export class PagesStore {
  private state: PagesState;
  private listeners = new Set<() => void>();

  constructor(initialState: { pages: Page[]; active?: string | null }) {
    const entities = initialState.pages.reduce<PagesState>(
      (acc, page) => {
        acc.pages[page.id] = { ...page, originalParentId: page.parentId };
        acc.pageIds.push(page.id);
        return acc;
      },
      { pages: {}, pageIds: [] },
    );

    this.state = {
      ...entities,
      active: initialState.active ?? null,
    };
  }

  // --- Core sync external store methods ---
  getSnapshot = () => this.state;

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => void this.listeners.delete(listener);
  };

  private setState(updater: PagesState | ((prev: PagesState) => PagesState)) {
    this.state = typeof updater === "function" ? updater(this.state) : updater;
    this.listeners.forEach((listener) => listener());
  }

  // --- Actions ---
  updatePage = (id: string, data: Partial<Page>) => {
    this.setState((prev) => {
      if (!prev.pages[id]) return prev;
      return {
        ...prev,
        pages: {
          ...prev.pages,
          [id]: { ...prev.pages[id], ...data },
        },
      };
    });
  };

  setActive = (id: string | null) => {
    this.setState((prev) => ({ ...prev, active: id }));
  };

  // --- Getters ---
  visiblePages = () => {
    const rootId = "visible";
    const childrenMap = this.buildChildrenMap(rootId);
    const result: Page[] = [];

    for (const id of childrenMap[rootId]!) {
      this.dfsTraverse(id, childrenMap, (page) => {
        if (page.isArchived) return false; // skip subtree
        result.push(page);
        return true; // continue to children
      });
    }
    return result;
  };

  visibleByGroup = (group: string) => {
    return Object.values(this.state.pages).filter(
      (page) => !page.isArchived && page.type === group,
    );
  };

  favorites = () => {
    const childrenMap = this.buildChildrenMap("favorite");
    const result: Page[] = [];

    // Start DFS from all favorite pages
    for (const page of Object.values(this.state.pages)) {
      if (page.isFavorite && !page.isArchived) {
        // Add favorite page with parentId set to null
        result.push({ ...page, parentId: null });

        // Add all its children
        for (const childId of childrenMap[page.id] ?? []) {
          this.dfsTraverse(childId, childrenMap, (page) => {
            if (page.isArchived) return false; // skip archived pages
            result.push(page);
            return true; // continue to children
          });
        }
      }
    }

    return result;
  };

  archivedPages = () => {
    const childrenMap = this.buildChildrenMap("trash");
    const result: Page[] = [];

    // Start DFS from all archived pages
    for (const page of Object.values(this.state.pages)) {
      if (page.isArchived) {
        // Add archived page with parentId set to null
        result.push({ ...page, parentId: null });

        // Add all its children
        for (const childId of childrenMap[page.id] ?? []) {
          this.dfsTraverse(childId, childrenMap, (page) => {
            result.push(page);
            return true; // continue to all children
          });
        }
      }
    }

    return result;
  };

  // --- Helpers ---
  /**
   * Generic DFS traversal helper
   * @param id - Starting node ID
   * @param childrenMap - Map of parent IDs to child IDs
   * @param callback - Function called for each node. Return false to skip traversing children.
   */
  private dfsTraverse(
    id: string,
    childrenMap: Record<string, string[]>,
    callback: (page: Page) => boolean | void,
  ): void {
    const page = this.state.pages[id];
    if (!page) return;

    // Execute callback, if it returns false, skip children
    const shouldContinue = callback(page);
    if (shouldContinue === false) return;

    // Traverse children
    const children = childrenMap[id];
    if (children) {
      for (const childId of children) {
        this.dfsTraverse(childId, childrenMap, callback);
      }
    }
  }

  private buildChildrenMap(rootId: string): Record<string, string[]> {
    const map: Record<string, string[]> = {};
    for (const pageId of this.state.pageIds) {
      const page = this.state.pages[pageId]!;
      const parentId = page.originalParentId ?? rootId;
      map[parentId] ??= [];
      map[parentId].push(page.id);
    }
    return map;
  }
}
