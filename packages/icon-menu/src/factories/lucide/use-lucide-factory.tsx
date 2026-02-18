"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import { betterFetch } from "@better-fetch/fetch";
import dynamicIconImports from "lucide-react/dynamicIconImports";

import { COLOR } from "@notion-kit/common/colors";
import type { LucideName } from "@notion-kit/icon-block";
import { LucideIcon } from "@notion-kit/icon-block";
import { randomItem } from "@notion-kit/utils";

import { useRecentIcons } from "../_hooks";
import { ColorPicker } from "../../_components/color-picker";
import type {
  IconFactoryResult,
  IconItem,
  IconSection,
  RenderIconOptions,
  SelectOptions,
} from "../types";

type IconTag = [name: LucideName, tags: string[]];

export interface UseLucideFactoryOptions {
  defaultColor?: string;
  recentLimit?: number;
}

export function useLucideFactory(
  options: UseLucideFactoryOptions = {},
): IconFactoryResult {
  const { defaultColor = COLOR.default, recentLimit = 20 } = options;

  const [isLoading, startTransition] = useTransition();
  const [color, setColor] = useState<string>(defaultColor);
  const [tags, setTags] = useState<IconTag[]>([]);

  const allIcons = useMemo(
    () => Object.keys(dynamicIconImports) as LucideName[],
    [],
  );

  const { recentIds, trackRecent } = useRecentIcons({
    storageKey: "recent:lucide",
    maxLimit: recentLimit,
    strategy: "recency",
  });

  // Fetch tags for search from lucide API
  useEffect(() => {
    const fetchTags = async () => {
      const { data, error } = await betterFetch<Record<string, string[]>>(
        "https://lucide.dev/api/tags",
      );
      if (error) {
        console.error("Failed to fetch lucide tags", error);
        return;
      }
      setTags(Object.entries(data) as IconTag[]);
    };

    startTransition(() => void fetchTags());
  }, []);

  // Build tag lookup map for search
  const tagMap = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const [name, keywords] of tags) {
      map.set(name, keywords);
    }
    return map;
  }, [tags]);

  const sections: IconSection[] = useMemo(() => {
    const result: IconSection[] = [];

    if (recentIds.length > 0) {
      result.push({
        id: "recent",
        label: "Recent",
        iconIds: recentIds,
      });
    }

    result.push({
      id: "all",
      label: "Icons",
      iconIds: allIcons,
    });

    return result;
  }, [allIcons, recentIds]);

  const getItem = useCallback(
    (id: string): IconItem => ({
      id,
      name: id,
      keywords: tagMap.get(id) ?? [],
    }),
    [tagMap],
  );

  const search = useCallback(
    (query: string): string[] => {
      const q = query.toLowerCase().trim();
      if (!q) return [];

      const keywords = q.split(" ");
      return allIcons.filter((name) =>
        keywords.some(
          (kw) =>
            name.includes(kw) ||
            (tagMap.get(name) ?? []).some((tag) => tag.includes(kw)),
        ),
      );
    },
    [allIcons, tagMap],
  );

  const renderIcon = useCallback(
    (item: IconItem, opts: RenderIconOptions) => (
      <LucideIcon
        icon={{
          type: "lucide",
          src: item.id as LucideName,
          color: opts.variantValue ?? color,
        }}
        className="size-4.5"
        strokeWidth={2.2}
      />
    ),
    [color],
  );

  const toIconData = useCallback(
    (item: IconItem, opts: SelectOptions) => ({
      type: "lucide" as const,
      src: item.id as LucideName,
      color: opts.variantValue ?? color,
    }),
    [color],
  );

  const onSelect = useCallback(
    (item: IconItem) => {
      trackRecent(item.id);
    },
    [trackRecent],
  );

  const getRandomIcon = useCallback((): IconItem => {
    const id = randomItem(allIcons);
    return getItem(id);
  }, [allIcons, getItem]);

  const toolbar = useMemo(
    () => <ColorPicker palette={COLOR} value={color} onSelect={setColor} />,
    [color],
  );

  return {
    id: "lucide",
    label: "Icons",
    sections,
    getItem,
    search,
    renderIcon,
    toIconData,
    toolbar,
    frequentKey: "recent:lucide",
    isLoading,
    onSelect,
    getRandomIcon,
  };
}
