import type { IconItem } from "@/icon-menu/factories";

export function getIconStringValue(item: IconItem) {
  return [item.name, ...item.keywords].filter(Boolean).join(" ");
}
