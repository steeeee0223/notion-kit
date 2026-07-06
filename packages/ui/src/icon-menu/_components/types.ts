import type { IconItem } from "../factories";

export interface IconAutocompleteItem {
  id: string;
  sectionId: string;
  sectionLabel: string;
  item: IconItem;
}

export interface PaletteProps<T extends Record<string, unknown>> {
  palette: T;
  value: keyof T;
  onSelect: (value: keyof T) => void;
}
