import { useMemo } from "react";

import type { IconData } from "@/icon-block";
import type { IconFactoryResult, IconItem } from "@/icon-menu/factories";
import {
  Autocomplete,
  AutocompleteContent,
  AutocompleteEmpty,
  AutocompleteStatus,
  Spinner,
} from "@/primitives";

import { MenuSearchBar } from "./menu-search-bar";
import { getIconStringValue } from "./utils";
import { VirtualizedIconGrid } from "./virtualized-icon-grid";

export function IconGridMenu({
  factory,
  searchQuery,
  setSearchQuery,
  onSelect,
  onRandomSelect,
}: {
  factory: IconFactoryResult;
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  onSelect?: (iconData: IconData) => void;
  onRandomSelect: () => void;
}) {
  const autocompleteItems = useMemo<IconItem[]>(
    () =>
      factory.sections.flatMap((section) =>
        section.iconIds.map((id) => ({
          ...factory.getItem(id),
          sectionId: section.id,
          sectionLabel: section.label,
        })),
      ),
    [factory],
  );

  return (
    <Autocomplete<IconItem>
      grid
      virtualized
      inline
      open
      autoHighlight="always"
      openOnInputClick
      items={autocompleteItems}
      itemToStringValue={getIconStringValue}
      value={searchQuery}
      onValueChange={(value, details) => {
        if (details.reason !== "item-press") {
          setSearchQuery(value);
        }
      }}
    >
      <MenuSearchBar
        onRandomSelect={onRandomSelect}
        onSearchClear={() => setSearchQuery("")}
        Palette={factory.renderToolbar?.()}
      />
      <AutocompleteContent variant="inline">
        {factory.isLoading && (
          <AutocompleteStatus className="flex items-center gap-2">
            <Spinner className="fill-icon" />
            Searching...
          </AutocompleteStatus>
        )}
        <AutocompleteEmpty className="h-[214px] justify-center">
          No results
        </AutocompleteEmpty>
        <VirtualizedIconGrid factory={factory} onSelect={onSelect} />
      </AutocompleteContent>
    </Autocomplete>
  );
}
