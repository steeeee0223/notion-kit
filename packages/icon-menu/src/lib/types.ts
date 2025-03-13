type ReverseMap<T> = T[keyof T];

/** @deprecated */
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

/** Used in useEmojiMenu */
export type EmojiCategoryList = ReverseMap<typeof EmojiCategory>;
export interface EmojiSettingsType {
  buttonSize: {
    value: number;
  };
  categories: {
    value?: EmojiCategoryList[];
  };
  perLine: {
    value: number;
  };
  showFrequent: {
    value: boolean;
    key?: string;
    limit?: number;
    prefix?: string;
  };
}
export type MapEmojiCategoryList = Map<EmojiCategoryList, boolean>;
export type SetFocusedAndVisibleSectionsType = (
  visibleSections: MapEmojiCategoryList,
  categoryId?: EmojiCategoryList,
) => void;

/** Used in types */
export interface i18nProps {
  categories: Record<EmojiCategoryList, string>;
  clear: string;
  pick: string;
  search: string;
  searchNoResultsSubtitle: string;
  searchNoResultsTitle: string;
  searchResult: string;
  skins: Record<"1" | "2" | "3" | "4" | "5" | "6" | "choose", string>;
}

/** Used in EmojiPickerRow */
export interface GridRow {
  id: number;
  elements: string[];
}
