import { useCallback, useMemo, useState } from "react";
import emojiMartData, {
  type Emoji,
  type EmojiMartData,
} from "@emoji-mart/data";

import { randomItem } from "@notion-kit/utils";

import { useRecentIcons } from "../_hooks";
import type {
  IconFactoryResult,
  IconItem,
  IconSection,
  RenderIconOptions,
  SelectOptions,
} from "../types";
import { CATEGORY_LABELS, DEFAULT_CATEGORIES, SkinPalette } from "./constants";
import type { EmojiCategoryList, Skin } from "./constants";
import { EmojiCategoryNav } from "./emoji-category-nav";
import { SkinPicker } from "./skin-picker";

function getNativeEmoji(emoji: Emoji, skin: Skin): string {
  const idx = emoji.skins.length >= 6 ? Number(skin) - 1 : 0;
  return emoji.skins[idx]!.native;
}

export interface UseEmojiFactoryOptions {
  frequentLimit?: number;
  maxSearchResults?: number;
}

export function useEmojiFactory(
  options: UseEmojiFactoryOptions = {},
): IconFactoryResult {
  const { frequentLimit = 16, maxSearchResults = 60 } = options;

  const [skin, setSkin] = useState<Skin>("1");

  const emojiMap = useMemo(() => {
    const data = emojiMartData as EmojiMartData;
    const map = new Map<string, Emoji>();
    for (const [id, emoji] of Object.entries(data.emojis)) {
      map.set(id, emoji);
    }
    return map;
  }, []);

  const emojiCategories = useMemo(
    () => (emojiMartData as EmojiMartData).categories,
    [],
  );

  const { recentIds, trackRecent } = useRecentIcons({
    storageKey: "emoji:frequent",
    maxLimit: frequentLimit,
    strategy: "recency",
  });

  // Build sections from emoji categories
  const sections: IconSection[] = useMemo(() => {
    const result: IconSection[] = [];

    if (recentIds.length > 0) {
      result.push({
        id: "frequent",
        label: CATEGORY_LABELS.frequent,
        iconIds: recentIds,
      });
    }

    for (const category of emojiCategories) {
      const catId = category.id as EmojiCategoryList;
      if (DEFAULT_CATEGORIES.includes(catId) && catId !== "frequent") {
        result.push({
          id: category.id,
          label: CATEGORY_LABELS[catId],
          iconIds: category.emojis,
        });
      }
    }

    return result;
  }, [emojiCategories, recentIds]);

  const getItem = useCallback(
    (id: string): IconItem => {
      const emoji = emojiMap.get(id);
      if (!emoji) {
        return { id, name: id, keywords: [] };
      }
      return {
        id: emoji.id,
        name: emoji.name,
        keywords: emoji.keywords,
      };
    },
    [emojiMap],
  );

  const search = useCallback(
    (query: string): string[] => {
      const q = query.toLowerCase().trim();
      if (!q) return [];

      const results: string[] = [];
      for (const [id, emoji] of emojiMap) {
        if (results.length >= maxSearchResults) break;
        if (
          emoji.name.toLowerCase().includes(q) ||
          emoji.keywords.some((kw: string) => kw.toLowerCase().includes(q)) ||
          id.toLowerCase().includes(q)
        ) {
          results.push(id);
        }
      }
      return results;
    },
    [emojiMap, maxSearchResults],
  );

  const renderIcon = useCallback(
    (item: IconItem, opts: RenderIconOptions) => {
      const emoji = emojiMap.get(item.id);
      if (!emoji) return null;
      const skinValue = (opts.variantValue ?? skin) as Skin;
      return (
        <span
          className="relative text-primary"
          style={{
            fontFamily:
              '"Apple Color Emoji", "Segoe UI Emoji", NotoColorEmoji, "Noto Color Emoji", "Segoe UI Symbol", "Android Emoji", EmojiSymbols',
          }}
          data-emoji-set="native"
        >
          {getNativeEmoji(emoji, skinValue)}
        </span>
      );
    },
    [emojiMap, skin],
  );

  const toIconData = useCallback(
    (item: IconItem, opts: SelectOptions) => {
      const emoji = emojiMap.get(item.id);
      if (!emoji) return { type: "emoji" as const, src: item.id };
      const skinValue = (opts.variantValue ?? skin) as Skin;
      return {
        type: "emoji" as const,
        src: getNativeEmoji(emoji, skinValue),
      };
    },
    [emojiMap, skin],
  );

  const onSelect = useCallback(
    (item: IconItem) => {
      trackRecent(item.id);
    },
    [trackRecent],
  );

  const getRandomIcon = useCallback((): IconItem => {
    const allIds = Array.from(emojiMap.keys());
    const id = randomItem(allIds);
    return getItem(id);
  }, [emojiMap, getItem]);

  const toolbar = useMemo(
    () => <SkinPicker palette={SkinPalette} value={skin} onSelect={setSkin} />,
    [skin],
  );

  const activeCategoryIds = useMemo(
    () => sections.map((s) => s.id as EmojiCategoryList),
    [sections],
  );

  return {
    id: "emoji",
    label: "Emojis",
    sections,
    getItem,
    search,
    renderIcon,
    toIconData,
    toolbar,
    navigation: (scrollToSection, activeSectionId) => (
      <EmojiCategoryNav
        categories={activeCategoryIds}
        activeSectionId={activeSectionId}
        scrollToSection={scrollToSection}
      />
    ),
    onSelect,
    getRandomIcon,
  };
}
