"use client";

import { useCallback, useMemo } from "react";
import { useLocalStorage } from "usehooks-ts";

import { useCustomFactory } from "../custom";
import type { IconFactoryResult, IconItem } from "../types";

interface StoredUploadIcon {
  id: string;
  url: string;
}

export interface UseUploadFactoryOptions {
  /** Factory id, defaults to "upload" */
  id?: string;
  /** Tab label, defaults to "Uploads" */
  label?: string;
  /** Max stored icons before oldest are evicted */
  maxStored?: number;
  recentLimit?: number;
}

/**
 * A factory for user-uploaded icons (URL submissions + file uploads).
 * Built on top of `useCustomFactory`, persisting icons in localStorage.
 * New icons are automatically stored when `onSelect` is called.
 */
export function useUploadFactory(
  options: UseUploadFactoryOptions = {},
): IconFactoryResult {
  const {
    id = "upload",
    label = "Uploads",
    maxStored = 50,
    recentLimit = 20,
  } = options;

  const [storedIcons, setStoredIcons] = useLocalStorage<StoredUploadIcon[]>(
    `icon-menu:${id}`,
    [],
  );

  // Convert stored icons into the CustomIcon format
  const customIcons = useMemo(
    () =>
      storedIcons.map((icon) => ({
        id: icon.id,
        name: icon.id,
        url: icon.url,
      })),
    [storedIcons],
  );

  const base = useCustomFactory({
    id,
    label,
    icons: customIcons,
    recentLimit,
  });

  // Wrap onSelect to persist new icons into localStorage
  const onSelect = useCallback(
    (item: IconItem) => {
      base.onSelect?.(item);
      setStoredIcons((prev) => {
        if (prev.some((i) => i.id === item.id)) return prev;
        return [{ id: item.id, url: item.id }, ...prev].slice(0, maxStored);
      });
    },
    [base, setStoredIcons, maxStored],
  );

  return {
    ...base,
    onSelect,
    hidden: storedIcons.length === 0,
  };
}
