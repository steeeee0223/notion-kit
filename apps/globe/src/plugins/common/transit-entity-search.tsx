import { useMemo, useState } from "react";

import { cn } from "@notion-kit/cn";
import { Icon } from "@notion-kit/icons";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
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

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return items.slice(0, 80);
    return items
      .filter((item) => item.searchText.toLowerCase().includes(query))
      .slice(0, 80);
  }, [items, search]);

  function handleSelect(item: TransitSearchItem<T>) {
    onSelect(item.value);
    setSearch("");
    setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <MenuItem
          icon={<Icon.MagnifyingGlass className="size-4" />}
          label={label}
          data-disabled={disabled}
        />
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[342px] p-0">
        <Command shouldFilter={false}>
          <CommandInput
            value={search}
            onValueChange={setSearch}
            placeholder={placeholder}
          />
          <CommandList className="max-h-100 overflow-y-auto">
            {recentItems.length > 0 && (
              <CommandGroup className={commandGroupClassName} heading="Recent">
                {recentItems.map((item) => (
                  <SearchItem
                    key={`recent-${item.key}`}
                    item={item}
                    onSelect={handleSelect}
                  />
                ))}
              </CommandGroup>
            )}

            <CommandGroup className={commandGroupClassName} heading={label}>
              {filteredItems.map((item) => (
                <SearchItem
                  key={item.key}
                  item={item}
                  onSelect={handleSelect}
                />
              ))}
            </CommandGroup>

            {!isLoading && filteredItems.length === 0 && (
              <CommandEmpty className="py-6 text-center text-sm text-secondary">
                No matches found
              </CommandEmpty>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

const commandGroupClassName = cn(
  "flex flex-col gap-px px-0",
  "**:[[cmdk-group-heading]]:mt-1.5 **:[[cmdk-group-heading]]:mb-2 **:[[cmdk-group-heading]]:flex **:[[cmdk-group-heading]]:items-center **:[[cmdk-group-heading]]:truncate **:[[cmdk-group-heading]]:px-3.5 **:[[cmdk-group-heading]]:py-0 **:[[cmdk-group-heading]]:leading-tight **:[[cmdk-group-heading]]:text-secondary **:[[cmdk-group-heading]]:select-none",
);

interface SearchItemProps<T> {
  item: TransitSearchItem<T>;
  onSelect: (item: TransitSearchItem<T>) => void;
}

function SearchItem<T>({ item, onSelect }: SearchItemProps<T>) {
  return (
    <CommandItem
      asChild
      value={item.searchText}
      onSelect={() => onSelect(item)}
    >
      <MenuItem
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
      ></MenuItem>
    </CommandItem>
  );
}

function normalizeBadgeColor(color: string | null | undefined) {
  if (!color) return "#6b7280";
  return color.startsWith("#") ? color : `#${color}`;
}
