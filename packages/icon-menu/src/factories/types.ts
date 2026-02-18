import type { IconData } from "@notion-kit/icon-block";

/** A single item in the icon grid */
export interface IconItem {
  id: string;
  name: string;
  keywords: string[];
}

/** A category/section of icons */
export interface IconSection {
  id: string;
  label: string;
  iconIds: string[];
}

/** Options passed to renderIcon */
export interface RenderIconOptions {
  /** Current icon variant value, e.g. skin tone for emojis, color for lucide/notion */
  variantValue?: string;
}

/** Options passed to toIconData */
export interface SelectOptions {
  variantValue?: string;
}

export interface IconFactoryResult {
  id: string;
  label: string;
  sections: IconSection[];
  getItem: (id: string) => IconItem;
  search: (query: string) => string[];
  renderIcon: (item: IconItem, options: RenderIconOptions) => React.ReactNode;
  toIconData: (item: IconItem, options: SelectOptions) => IconData;
  toolbar?: React.ReactNode;
  navigation?: (
    scrollToSection: (sectionId: string) => void,
    activeSectionId: string | null,
  ) => React.ReactNode;
  frequentKey?: string;
  isLoading?: boolean;
  onSelect?: (item: IconItem) => void;
  getRandomIcon?: () => IconItem;
}

export interface IconFactoryConfig {
  providers: IconFactoryResult[];
}
