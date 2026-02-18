"use client";

import { useCallback, useMemo } from "react";

import { randomItem } from "@notion-kit/utils";

import { useRecentIcons } from "../_hooks";
import type {
  IconFactoryResult,
  IconItem,
  IconSection,
  RenderIconOptions,
  SelectOptions,
} from "../types";

interface CustomIcon {
  id: string;
  name: string;
  url: string;
  keywords?: string[];
}

export interface UseCustomFactoryOptions {
  id?: string;
  label?: string;
  icons: CustomIcon[];
  recentLimit?: number;
}

export function useCustomFactory(
  options: UseCustomFactoryOptions,
): IconFactoryResult {
  const { id = "custom", label = "Custom", icons, recentLimit = 20 } = options;

  const iconMap = useMemo(() => {
    const map = new Map<string, CustomIcon>();
    for (const icon of icons) {
      map.set(icon.id, icon);
    }
    return map;
  }, [icons]);

  const { recentIds, trackRecent } = useRecentIcons({
    storageKey: `recent:${id}`,
    maxLimit: recentLimit,
    strategy: "recency",
  });

  const sections: IconSection[] = useMemo(() => {
    const result: IconSection[] = [];

    if (recentIds.length > 0) {
      result.push({ id: "recent", label: "Recent", iconIds: recentIds });
    }

    result.push({
      id: "all",
      label,
      iconIds: icons.map((icon) => icon.id),
    });

    return result;
  }, [icons, label, recentIds]);

  const getItem = useCallback(
    (itemId: string): IconItem => {
      const icon = iconMap.get(itemId);
      if (!icon) {
        return { id: itemId, name: itemId, keywords: [] };
      }
      return {
        id: icon.id,
        name: icon.name,
        keywords: icon.keywords ?? [],
      };
    },
    [iconMap],
  );

  const search = useCallback(
    (query: string): string[] => {
      const q = query.toLowerCase().trim();
      if (!q) return [];

      return icons
        .filter(
          (icon) =>
            icon.name.toLowerCase().includes(q) ||
            icon.keywords?.some((kw) => kw.toLowerCase().includes(q)),
        )
        .map((icon) => icon.id);
    },
    [icons],
  );

  const renderIcon = useCallback(
    (item: IconItem, _opts: RenderIconOptions) => {
      const icon = iconMap.get(item.id);
      if (!icon) return null;
      return (
        <img src={icon.url} alt={icon.name} className="size-5 object-contain" />
      );
    },
    [iconMap],
  );

  const toIconData = useCallback(
    (item: IconItem, _opts: SelectOptions) => {
      const icon = iconMap.get(item.id);
      return {
        type: "url" as const,
        src: icon?.url ?? item.id,
      };
    },
    [iconMap],
  );

  const getRandomIcon = useCallback((): IconItem => {
    const randomId = randomItem(icons.map((i) => i.id));
    return getItem(randomId);
  }, [icons, getItem]);

  return {
    id,
    label,
    sections,
    getItem,
    search,
    renderIcon,
    toIconData,
    frequentKey: `recent:${id}`,
    onSelect: useCallback(
      (item: IconItem) => trackRecent(item.id),
      [trackRecent],
    ),
    getRandomIcon,
  };
}
