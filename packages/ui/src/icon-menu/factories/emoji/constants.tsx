import { Icon } from "@notion-kit/icons";

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

export const CATEGORIES: Record<
  EmojiCategoryList,
  { icon: React.ReactNode; label: string }
> = {
  frequent: {
    icon: <Icon.Clock className="size-5 fill-current" />,
    label: "Recent",
  },
  people: {
    icon: <Icon.EmojiFace className="size-5 fill-current" />,
    label: "People",
  },
  nature: {
    icon: <Icon.Leaf className="size-5 fill-current" />,
    label: "Animals and nature",
  },
  foods: {
    icon: <Icon.Carrot className="size-5 fill-current" />,
    label: "Food and drink",
  },
  activity: {
    icon: <Icon.SoccerBall className="size-5 fill-current" />,
    label: "Activity",
  },
  places: {
    icon: <Icon.Airplane className="size-5 fill-current" />,
    label: "Travel and places",
  },
  objects: {
    icon: <Icon.LightBulbBright className="size-5 fill-current" />,
    label: "Objects",
  },
  symbols: {
    icon: <Icon.CheckmarkCircle className="size-5 fill-current" />,
    label: "Symbols",
  },
  flags: {
    icon: <Icon.Flag className="size-5 fill-current" />,
    label: "Flags",
  },
  custom: {
    icon: <Icon.SquareGrid2x2 className="size-5 fill-current" />,
    label: "Custom",
  },
};
