"use client";

import { useState, useSyncExternalStore } from "react";

export abstract class Store<T extends object> {
  private state: T;
  private listeners = new Set<() => void>();

  constructor(initialState: T) {
    this.state = initialState;
  }

  // --- Core sync external store methods ---
  getSnapshot = () => this.state;

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => void this.listeners.delete(listener);
  };

  setState = (updater: T | ((prev: T) => T)) => {
    this.state = typeof updater === "function" ? updater(this.state) : updater;
    this.listeners.forEach((listener) => listener());
  };
}

export function useStore<T extends object, S extends Store<T>>(
  storeInstance: S,
) {
  const [store] = useState(() => storeInstance);

  const state = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getSnapshot,
  );

  return { state, store };
}
