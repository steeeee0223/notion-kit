import type { IconData } from "@/icon-block";

/** A single item in the icon grid */
export interface IconItem {
  id: string;
  name: string;
  keywords: string[];
  sectionId?: string;
  sectionLabel?: string;
}

/** A category/section of icons */
export interface IconSection {
  id: string;
  label: string;
  iconIds: string[];
}

export interface IconFactoryResult {
  id: string;
  label: string;
  sections: IconSection[];
  getItem: (id: string) => IconItem;
  select?: (id: string) => void;
  search: (query: string) => string[];
  toIconData: (item: IconItem) => IconData;
  renderIcon: (item: IconItem) => React.ReactNode;
  renderToolbar?: () => React.ReactNode;
  renderNavigation?: (
    scrollToSection: (sectionId: string) => void,
    activeSectionId: string | null,
  ) => React.ReactNode;
  isLoading?: boolean;
  /** When true, the tab is not rendered in the menu */
  hidden?: boolean;
  getRandomIcon?: () => IconItem;
}

export interface IconFactoryConfig {
  providers: IconFactoryResult[];
}
