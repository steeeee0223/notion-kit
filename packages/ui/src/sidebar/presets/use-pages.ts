"use client";

import { useState, useSyncExternalStore } from "react";

import { Page } from "@notion-kit/schemas";

import { PagesStore } from "./_lib";

export interface UsePagesConfig {
  pages: Page[];
  active?: string | null;
}

export function usePages({ pages, active }: UsePagesConfig) {
  const [store] = useState(() => new PagesStore({ pages, active }));

  const state = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getSnapshot,
  );

  return {
    state,
    setActive: store.setActive,
    update: store.updatePage,
    visiblePages: store.visiblePages,
    visibleByGroup: store.visibleByGroup,
    favorites: store.favorites,
    archivedPages: store.archivedPages,
  };
}
