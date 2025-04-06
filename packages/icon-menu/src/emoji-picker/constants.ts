import type { EmojiMartData } from "@emoji-mart/data";

import type { IconSettingsType } from "../lib";
import { EmojiCategory, EmojiCategoryList, I18nProps, Skin } from "./types";

export const DEFAULT_CATEGORIES: EmojiCategoryList[] = [
  EmojiCategory.Frequent,
  EmojiCategory.People,
  EmojiCategory.Nature,
  EmojiCategory.Foods,
  EmojiCategory.Activity,
  EmojiCategory.Places,
  EmojiCategory.Objects,
  EmojiCategory.Symbols,
  EmojiCategory.Flags,
];

export const EmojiSettings: IconSettingsType<EmojiCategoryList> = {
  categories: DEFAULT_CATEGORIES,
  maxSearchResult: 60,
  buttonSize: 32,
  perLine: 12,
  showFrequent: {
    limit: 16,
    value: true,
    key: EmojiCategory.Frequent,
  },
};

export const SkinPalette: Record<Skin, { emoji: string; name: string }> = {
  "1": { emoji: "✋", name: "Default" },
  "2": { emoji: "✋🏻", name: "Light" },
  "3": { emoji: "✋🏼", name: "Medium-Light" },
  "4": { emoji: "✋🏽", name: "Medium" },
  "5": { emoji: "✋🏾", name: "Medium-Dark" },
  "6": { emoji: "✋🏿", name: "Dark" },
};

export const i18n: I18nProps = {
  categories: {
    activity: "Activity",
    custom: "Custom",
    flags: "Flags",
    foods: "Food & Drink",
    frequent: "Frequently used",
    nature: "Animals & Nature",
    objects: "Objects",
    people: "Smileys & People",
    places: "Travel & Places",
    symbols: "Symbols",
  },
  clear: "Clear",
  pick: "Pick an emoji...",
  search: "Search all emoji",
  searchNoResultsSubtitle: "That emoji couldn’t be found",
  searchNoResultsTitle: "Oh no!",
  searchResult: "Search Results",
  skins: {
    "1": "Default",
    "2": "Light",
    "3": "Medium-Light",
    "4": "Medium",
    "5": "Medium-Dark",
    "6": "Dark",
    choose: "Choose default skin tone",
  },
};

export const DEFAULT_EMOJI_LIBRARY: EmojiMartData = {
  aliases: {},
  categories: [{ id: "people", emojis: ["+1"] }],
  emojis: {
    "+1": {
      id: "+1",
      keywords: [],
      name: "Thumbs Up",
      skins: [
        { native: "👍", unified: "1f44d" },
        { native: "👍🏻", unified: "1f44d-1f3fb" },
        { native: "👍🏼", unified: "1f44d-1f3fc" },
        { native: "👍🏽", unified: "1f44d-1f3fd" },
        { native: "👍🏾", unified: "1f44d-1f3fe" },
        { native: "👍🏿", unified: "1f44d-1f3ff" },
      ],
      version: 1,
    },
  },
  sheet: { cols: 1, rows: 1 },
};
