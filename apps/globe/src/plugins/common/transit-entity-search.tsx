import { useMemo, useState } from "react";

import { Icon } from "@notion-kit/icons";
import {
  Autocomplete,
  AutocompleteCollection,
  AutocompleteContent,
  AutocompleteEmpty,
  AutocompleteGroup,
  AutocompleteInput,
  AutocompleteItem,
  AutocompleteLabel,
  AutocompleteList,
  MenuItem,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@notion-kit/ui/primitives";

export interface TransitSearchItem<T> {
  value: T;
  key: string;
  title: string;
  subtitle: string;
  badge?: string | null;
  color?: string | null;
  searchText: string;
}

interface TransitEntitySearchProps<T> {
  label: string;
  placeholder: string;
  items: TransitSearchItem<T>[];
  recentItems: TransitSearchItem<T>[];
  disabled?: boolean;
  isLoading?: boolean;
  onSelect: (item: T) => void;
}

export function TransitEntitySearch<T>({
  label,
  placeholder,
  items,
  recentItems,
  disabled,
  isLoading,
  onSelect,
}: TransitEntitySearchProps<T>) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const groups = useMemo(
    () => [
      { label: "Recent", items: recentItems },
      { label, items },
    ],
    [items, label, recentItems],
  );

  function handleSelect(item: TransitSearchItem<T>) {
    onSelect(item.value);
    setSearch("");
    setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <MenuItem
            icon={<Icon.MagnifyingGlass className="size-4" />}
            label={label}
            data-disabled={disabled}
          />
        }
      />
      <PopoverContent align="start" className="w-[342px] p-0">
        <Autocomplete<TransitSearchItem<T>>
          items={groups}
          itemToStringValue={(item) => item.searchText}
          value={search}
          onValueChange={setSearch}
          open
          autoHighlight="always"
          openOnInputClick
        >
          <AutocompleteInput placeholder={placeholder} />
          <AutocompleteContent role="presentation" variant="inline">
            {!isLoading && (
              <AutocompleteEmpty className="py-6 text-center text-sm text-secondary">
                No matches found
              </AutocompleteEmpty>
            )}
            <AutocompleteList className="max-h-100">
              {(group: (typeof groups)[number]) => {
                if (group.label === "Recent" && group.items.length === 0) {
                  return null;
                }

                return (
                  <AutocompleteGroup key={group.label} items={group.items}>
                    <AutocompleteLabel title={group.label} />
                    <AutocompleteCollection>
                      {(item: TransitSearchItem<T>) => (
                        <SearchItem
                          key={`${group.label}-${item.key}`}
                          item={item}
                          onSelect={handleSelect}
                        />
                      )}
                    </AutocompleteCollection>
                  </AutocompleteGroup>
                );
              }}
            </AutocompleteList>
          </AutocompleteContent>
        </Autocomplete>
      </PopoverContent>
    </Popover>
  );
}

interface SearchItemProps<T> {
  item: TransitSearchItem<T>;
  onSelect: (item: TransitSearchItem<T>) => void;
}

function SearchItem<T>({ item, onSelect }: SearchItemProps<T>) {
  return (
    <AutocompleteItem
      value={item}
      className="h-12"
      label={
        <span
          className="max-w-16 truncate rounded-sm px-1.5 text-xs font-bold text-white"
          style={{ backgroundColor: normalizeBadgeColor(item.color) }}
        >
          {item.title}
        </span>
      }
      desc={item.subtitle}
      onClick={() => onSelect(item)}
    />
  );
}

function normalizeBadgeColor(color: string | null | undefined) {
  if (!color) return "#6b7280";
  return color.startsWith("#") ? color : `#${color}`;
}
