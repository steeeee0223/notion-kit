export type EmojiCategoryList =
  | "activity"
  | "custom"
  | "flags"
  | "foods"
  | "frequent"
  | "nature"
  | "objects"
  | "people"
  | "places"
  | "symbols";

export type Skin = "1" | "2" | "3" | "4" | "5" | "6";

export const DEFAULT_CATEGORIES: EmojiCategoryList[] = [
  "frequent",
  "people",
  "nature",
  "foods",
  "activity",
  "places",
  "objects",
  "symbols",
  "flags",
];

export const SkinPalette: Record<Skin, { emoji: string; name: string }> = {
  "1": { emoji: "✋", name: "Default" },
  "2": { emoji: "✋🏻", name: "Light" },
  "3": { emoji: "✋🏼", name: "Medium-Light" },
  "4": { emoji: "✋🏽", name: "Medium" },
  "5": { emoji: "✋🏾", name: "Medium-Dark" },
  "6": { emoji: "✋🏿", name: "Dark" },
};

export const CATEGORY_LABELS: Record<EmojiCategoryList, string> = {
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
};
