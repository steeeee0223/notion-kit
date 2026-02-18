"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import { betterFetch } from "@better-fetch/fetch";

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

const NOTION_ICON_COLORS = [
  "gray",
  "lightgray",
  "brown",
  "yellow",
  "orange",
  "green",
  "blue",
  "purple",
  "pink",
  "red",
] as const;
type NotionIconColor = (typeof NOTION_ICON_COLORS)[number];

const DARK_THEME_COLORS: Record<NotionIconColor, string> = {
  gray: "#D3D3D3",
  lightgray: "#7F7F7F",
  brown: "#AA755F",
  yellow: "#CA8E1B",
  orange: "#D87620",
  green: "#2D9964",
  blue: "#2E7CD1",
  purple: "#9065B0",
  pink: "#C14C8A",
  red: "#D44C47",
};

const LIGHT_THEME_COLORS: Record<NotionIconColor, string> = {
  gray: "#787774",
  lightgray: "#979A9B",
  brown: "#64473A",
  yellow: "#CF9A2C",
  orange: "#D9730D",
  green: "#0F7B6C",
  blue: "#337EA9",
  purple: "#9065B0",
  pink: "#C14C8A",
  red: "#D44C47",
};

const DARK_PALETTE: Record<string, string> = Object.fromEntries(
  NOTION_ICON_COLORS.map((c) => [c, DARK_THEME_COLORS[c]]),
);
const LIGHT_PALETTE: Record<string, string> = Object.fromEntries(
  NOTION_ICON_COLORS.map((c) => [c, LIGHT_THEME_COLORS[c]]),
);

interface RawNotionIcon {
  dark: Record<NotionIconColor, string>;
  light: Record<NotionIconColor, string>;
  tooltip: string;
  tags: string[];
}
interface NotionIconData {
  id: string;
  name: string;
  pathData: string;
  tags: string[];
}

function extractPathD(svgString: string): string {
  const match = / d="([^"]+)"/.exec(svgString);
  return match?.[1] ?? "";
}

export interface UseNotionIconsFactoryOptions {
  theme?: "dark" | "light";
  defaultColor?: NotionIconColor;
  maxSearchResults?: number;
  recentLimit?: number;
}

export function useNotionIconsFactory(
  options: UseNotionIconsFactoryOptions = {},
): IconFactoryResult {
  const {
    theme = "dark",
    defaultColor = "gray",
    maxSearchResults = 80,
    recentLimit = 20,
  } = options;

  const palette = theme === "dark" ? DARK_PALETTE : LIGHT_PALETTE;
  const colorMap = theme === "dark" ? DARK_THEME_COLORS : LIGHT_THEME_COLORS;

  const [isPending, startTransition] = useTransition();
  const [color, setColor] = useState<NotionIconColor>(defaultColor);
  const [icons, setIcons] = useState<NotionIconData[]>([]);

  // Fetch and process icon data
  useEffect(() => {
    const load = async () => {
      const { data, error } = await betterFetch<Record<string, RawNotionIcon>>(
        "https://www.notion.so/icons/all",
      );
      if (error) {
        console.error("Failed to fetch Notion icons", error);
        return;
      }

      const processed: NotionIconData[] = [];
      for (const [id, entry] of Object.entries(data)) {
        // Extract path from the gray (first) variant of the current theme
        const svgString = entry[theme].gray;
        const pathData = extractPathD(svgString);
        if (!pathData) continue;
        processed.push({
          id,
          name: entry.tooltip,
          pathData,
          tags: entry.tags,
        });
      }
      setIcons(processed);
    };

    startTransition(() => void load());
  }, [theme]);

  const iconMap = useMemo(() => {
    const map = new Map<string, NotionIconData>();
    for (const icon of icons) {
      map.set(icon.id, icon);
    }
    return map;
  }, [icons]);

  const allIds = useMemo(() => icons.map((i) => i.id), [icons]);

  const { recentIds, trackRecent } = useRecentIcons({
    storageKey: "recent:notion",
    maxLimit: recentLimit,
    strategy: "recency",
  });

  const sections: IconSection[] = useMemo(() => {
    const result: IconSection[] = [];

    if (recentIds.length > 0) {
      result.push({ id: "recent", label: "Recent", iconIds: recentIds });
    }

    result.push({ id: "all", label: "Notion Icons", iconIds: allIds });
    return result;
  }, [allIds, recentIds]);

  const getItem = useCallback(
    (id: string): IconItem => {
      const icon = iconMap.get(id);
      if (!icon) return { id, name: id, keywords: [] };
      return { id: icon.id, name: icon.name, keywords: icon.tags };
    },
    [iconMap],
  );

  const search = useCallback(
    (query: string): string[] => {
      const q = query.toLowerCase().trim();
      if (!q) return [];

      const results: string[] = [];
      for (const icon of icons) {
        if (results.length >= maxSearchResults) break;
        if (
          icon.name.toLowerCase().includes(q) ||
          icon.id.toLowerCase().includes(q) ||
          icon.tags.some((tag) => tag.toLowerCase().includes(q))
        ) {
          results.push(icon.id);
        }
      }
      return results;
    },
    [icons, maxSearchResults],
  );

  const renderIcon = useCallback(
    (item: IconItem, _opts: RenderIconOptions) => {
      const icon = iconMap.get(item.id);
      if (!icon) return null;
      const fillColor = colorMap[color];
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill={fillColor}
          width={20}
          height={20}
        >
          <path d={icon.pathData} fill={fillColor} />
        </svg>
      );
    },
    [iconMap, color, colorMap],
  );

  const toIconData = useCallback(
    (item: IconItem, _opts: SelectOptions) => ({
      type: "url" as const,
      src: `https://www.notion.so/icons/${item.id}_${color}.svg`,
    }),
    [color],
  );

  const getRandomIcon = useCallback((): IconItem => {
    if (allIds.length === 0) return { id: "", name: "", keywords: [] };
    const id = randomItem(allIds);
    return getItem(id);
  }, [allIds, getItem]);

  const toolbar = useMemo(
    () => (
      <ColorPicker
        palette={palette}
        value={colorMap[color]}
        onSelect={(hex: string) => {
          // Find back the color name from the hex
          const entry = Object.entries(colorMap).find(([, v]) => v === hex) as
            | [NotionIconColor, string]
            | undefined;
          if (entry) setColor(entry[0]);
        }}
      />
    ),
    [color, palette, colorMap],
  );

  return {
    id: "notion",
    label: "Icons",
    sections,
    getItem,
    search,
    renderIcon,
    toIconData,
    toolbar,
    isLoading: isPending,
    onSelect: useCallback(
      (item: IconItem) => trackRecent(item.id),
      [trackRecent],
    ),
    getRandomIcon,
  };
}
