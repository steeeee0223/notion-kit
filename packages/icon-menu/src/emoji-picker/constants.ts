import type { EmojiSettingsType } from "@udecode/plate-emoji";

import type { Skin } from "./types";

export const EmojiSettings: EmojiSettingsType = {
  buttonSize: {
    value: 32,
  },
  categories: {
    value: undefined,
  },
  perLine: {
    value: 12,
  },
  showFrequent: {
    limit: 16,
    value: true,
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
