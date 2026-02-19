import type { IconData } from "@notion-kit/icon-block";

import type {
  IconFactoryResult,
  IconItem,
  IconSection,
  RenderIconOptions,
  SelectOptions,
} from "./types";

interface IconDefinition {
  id: string;
  name: string;
  keywords?: string[];
}

interface CreateIconFactoryConfig {
  id: string;
  label: string;
  icons: IconDefinition[];
  sections?: { id: string; label: string; iconIds: string[] }[];
  renderIcon: (item: IconItem, options: RenderIconOptions) => React.ReactNode;
  toIconData: (item: IconItem, options: SelectOptions) => IconData;
  toolbar?: React.ReactNode;
  navigation?: (
    scrollToSection: (sectionId: string) => void,
    activeSectionId: string | null,
  ) => React.ReactNode;
}

export function createIconFactory(
  config: CreateIconFactoryConfig,
): IconFactoryResult {
  const iconMap = new Map<string, IconItem>();
  for (const icon of config.icons) {
    iconMap.set(icon.id, {
      id: icon.id,
      name: icon.name,
      keywords: icon.keywords ?? [],
    });
  }

  const sections: IconSection[] = config.sections ?? [
    {
      id: "all",
      label: config.label,
      iconIds: config.icons.map((icon) => icon.id),
    },
  ];

  const search = (query: string) => {
    const q = query.toLowerCase().trim();
    if (!q) return [];
    return config.icons
      .filter(
        (icon) =>
          icon.name.toLowerCase().includes(q) ||
          icon.keywords?.some((kw) => kw.toLowerCase().includes(q)),
      )
      .map((icon) => icon.id);
  };

  return {
    id: config.id,
    label: config.label,
    sections,
    getItem: (id) => {
      const item = iconMap.get(id);
      if (!item)
        throw new Error(`Icon "${id}" not found in factory "${config.id}"`);
      return item;
    },
    search,
    renderIcon: config.renderIcon,
    toIconData: config.toIconData,
    toolbar: config.toolbar,
    navigation: config.navigation,
  };
}
