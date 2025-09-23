import type { Page } from "@notion-kit/schemas";
import { buildTree, type TreeNode } from "@notion-kit/tree";

export interface PagesState {
  pages: Record<string, Page>;
  pageIds: string[];
  active?: string | null;
}

export class PagesStore {
  private state: PagesState;
  private listeners = new Set<() => void>();

  constructor(initialState: { pages: Page[]; active?: string | null }) {
    const entities = initialState.pages.reduce<PagesState>(
      (acc, page) => {
        acc.pages[page.id] = page;
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
    const dfs = (id: string) => {
      const page = this.state.pages[id];
      if (!page || page.isArchived) return; // skip subtree
      result.push(page);

      if (!childrenMap[id]) return;
      for (const childId of childrenMap[id]) {
        dfs(childId);
      }
    };

    for (const id of childrenMap[rootId]!) {
      dfs(id);
    }
    return result;
  };

  visibleByGroup = (group: string) => {
    const pages = Object.values(this.state.pages).filter(
      (page) => !page.isArchived && page.type === group,
    );
    return buildTree(pages);
  };

  favorites = () => {
    const pages = Object.values(this.state.pages);
    return pages
      .filter((page) => page.isFavorite && !page.isArchived)
      .map<TreeNode<Page>>((fav) => ({
        ...fav,
        parentId: null,
        children: buildTree(pages, fav.id),
      }));
  };

  archivedPages = () => {
    const rootId = "trash";
    const childrenMap = this.buildChildrenMap(rootId);

    const result: Page[] = [];
    const dfs = (id: string, forceInclude: boolean) => {
      const page = this.state.pages[id];
      if (!page) return;

      const include = forceInclude || page.isArchived;
      if (include) result.push(page);

      for (const childId of childrenMap[id] ?? []) {
        dfs(childId, include);
      }
    };

    for (const id of childrenMap[rootId] ?? []) {
      dfs(id, false);
    }
    return result;
  };

  // --- Helpers ---
  private buildChildrenMap(rootId: string): Record<string, string[]> {
    const map: Record<string, string[]> = {};
    for (const pageId of this.state.pageIds) {
      const page = this.state.pages[pageId]!;
      const parentId = page.parentId ?? rootId;
      map[parentId] ??= [];
      map[parentId].push(page.id);
    }
    return map;
  }
}
