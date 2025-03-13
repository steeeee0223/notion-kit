import type { Emoji } from "@udecode/plate-emoji";

import type { Skin } from "./types";

export const getNativeEmoji = (emoji: Emoji, skin: Skin) =>
  emoji.skins.length >= 6
    ? emoji.skins[Number(skin) - 1]!.native
    : emoji.skins[0]!.native;
