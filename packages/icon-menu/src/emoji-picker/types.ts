import type {
  Emoji,
  EmojiCategoryList,
  EmojiSettingsType,
  i18nProps,
} from "@udecode/plate-emoji";
import type {
  IEmojiFloatingLibrary,
  MapEmojiCategoryList,
} from "@udecode/plate-emoji/react";
import React from "react";

type MutableRefs = React.RefObject<{
  content: React.RefObject<HTMLDivElement | null>;
  contentRoot: React.RefObject<HTMLDivElement | null>;
}>;

export type Skin = "1" | "2" | "3" | "4" | "5" | "6";

export interface UseEmojiPickerType {
  emojiLibrary: IEmojiFloatingLibrary;
  hasFound: boolean;
  i18n: i18nProps;
  skin: Skin;
  isSearching: boolean;
  refs: MutableRefs;
  searchResult: Emoji[];
  searchValue: string;
  visibleCategories: MapEmojiCategoryList;
  emoji?: Emoji;
  focusedCategory?: EmojiCategoryList;
  settings: EmojiSettingsType;
  setSkin: (skin: Skin) => void;
  setSearch: (value: string) => void;
  clearSearch: () => void;
  onSelectCategory: (id: EmojiCategoryList) => void;
  onSelectEmoji: (emoji: Emoji) => void;
}
