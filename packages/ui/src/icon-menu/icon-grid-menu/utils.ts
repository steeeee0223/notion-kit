import { IconItem } from "@/icon-menu/factories";

export interface IconAutocompleteItem {
  id: string;
  sectionId: string;
  sectionLabel: string;
  item: IconItem;
}

export function getIconAutocompleteStringValue({ item }: IconAutocompleteItem) {
  return [item.name, ...item.keywords].filter(Boolean).join(" ");
}
