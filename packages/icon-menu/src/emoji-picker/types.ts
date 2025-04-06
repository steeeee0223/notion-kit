import React from "react";
import { Emoji } from "@emoji-mart/data";

import type { CategoryData, IconSettingsType, IIconLibrary } from "../lib";

type ReverseMap<T> = T[keyof T];

export const EmojiCategory = {
  Activity: "activity",
  Custom: "custom",
  Flags: "flags",
  Foods: "foods",
  Frequent: "frequent",
  Nature: "nature",
  Objects: "objects",
  People: "people",
  Places: "places",
  Symbols: "symbols",
} as const;
export type EmojiCategoryList = ReverseMap<typeof EmojiCategory>;

type MapEmojiCategoryList = Map<EmojiCategoryList, boolean>;
export type SetFocusedAndVisibleSectionsType = (
  visibleSections: MapEmojiCategoryList,
  categoryId?: EmojiCategoryList,
) => void;

export type Skin = "1" | "2" | "3" | "4" | "5" | "6";

export interface I18nProps {
  categories: Record<EmojiCategoryList, string>;
  clear: string;
  pick: string;
  search: string;
  searchNoResultsSubtitle: string;
  searchNoResultsTitle: string;
  searchResult: string;
  skins: Record<Skin | "choose", string>;
}

export interface EmojiLibraryData {
  categories: CategoryData[];
  icons: Record<string, Emoji>;
  aliases: Record<string, string>;
}

export interface UseEmojiPickerType {
  emojiLibrary: IIconLibrary<Emoji, EmojiCategoryList>;
  hasFound: boolean;
  i18n: I18nProps;
  skin: Skin;
  isSearching: boolean;
  refs: React.RefObject<{
    content: React.RefObject<HTMLDivElement | null>;
    contentRoot: React.RefObject<HTMLDivElement | null>;
  }>;
  searchResult: Emoji[];
  searchValue: string;
  visibleCategories: MapEmojiCategoryList;
  emoji?: Emoji;
  focusedCategory?: EmojiCategoryList;
  settings: IconSettingsType<EmojiCategoryList>;
  setSkin: (skin: Skin) => void;
  setSearch: (value: string) => void;
  clearSearch: () => void;
  onSelectCategory: (id: EmojiCategoryList) => void;
  onSelectEmoji: (emoji: Emoji) => void;
}
