import { useMemo } from "react";

import { IconData } from "@/icon-block";
import { IconFactoryResult } from "@/icon-menu/factories";
import {
  Autocomplete,
  AutocompleteContent,
  AutocompleteEmpty,
  AutocompleteStatus,
  Spinner,
  useAutocompleteFilter,
} from "@/primitives";

import { MenuSearchBar } from "./menu-search-bar";
import { getIconAutocompleteStringValue, IconAutocompleteItem } from "./utils";
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
  const filter = useAutocompleteFilter();
  const autocompleteItems = useMemo<IconAutocompleteItem[]>(
    () =>
      factory.sections.flatMap((section) =>
        section.iconIds.map((id) => ({
          id,
          sectionId: section.id,
          sectionLabel: section.label,
          item: factory.getItem(id),
        })),
      ),
    [factory],
  );
  const filteredAutocompleteItems = useMemo(() => {
    const query = searchQuery.trim();
    if (!query) {
      return autocompleteItems;
    }

    return autocompleteItems.filter((item) =>
      filter.contains(item, query, getIconAutocompleteStringValue),
    );
  }, [autocompleteItems, filter, searchQuery]);

  return (
    <Autocomplete<IconAutocompleteItem>
      grid
      virtualized
      inline
      open
      autoHighlight="always"
      openOnInputClick
      items={autocompleteItems}
      filteredItems={filteredAutocompleteItems}
      itemToStringValue={getIconAutocompleteStringValue}
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
        Palette={factory.toolbar}
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
        <VirtualizedIconGrid
          factory={factory}
          items={filteredAutocompleteItems}
          onSelect={onSelect}
        />
      </AutocompleteContent>
    </Autocomplete>
  );
}
