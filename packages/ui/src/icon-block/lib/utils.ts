import { z } from "zod/v4";

import type { IconData } from "../types";
import { iconNodes } from "./data";

export function isEmoji(icon: IconData) {
  return icon.type === "emoji" && z.emoji().safeParse(icon.src).success;
}

export function isLucideIcon(
  icon: IconData,
): icon is Extract<IconData, { type: "lucide" }> {
  return icon.type === "lucide" && Object.hasOwn(iconNodes, icon.src);
}

export function getLetter(src: string, fallbackText: string) {
  const letter = src.length > 0 ? src[0]! : fallbackText;
  return letter.toUpperCase();
}
