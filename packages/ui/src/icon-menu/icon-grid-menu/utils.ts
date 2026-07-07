import type { IconItem } from "@/icon-menu/factories";

export interface IconAutocompleteItem {
  sectionId: string;
  sectionLabel: string;
  item: IconItem;
}

export function getIconAutocompleteStringValue({ item }: IconAutocompleteItem) {
  return [item.name, ...item.keywords].filter(Boolean).join(" ");
}
