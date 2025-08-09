import { z } from "zod/v4";

import type { LucideName } from "../types";
import { iconNodes } from "./data";

export const isEmoji = (text: string) => z.emoji().safeParse(text).success;

export const isLucideIcon = (name: string): name is LucideName => {
  return name in iconNodes;
};

export function getLetter(src: string, fallbackText: string) {
  const letter = src.length > 0 ? src[0]! : fallbackText;
  return letter.toUpperCase();
}

export function toPascalCase(s: string): string {
  return s
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}
