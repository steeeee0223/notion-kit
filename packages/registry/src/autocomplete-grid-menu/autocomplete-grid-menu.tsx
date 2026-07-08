"use client";

import React from "react";

import { Icon } from "@notion-kit/icons";
import {
  Autocomplete,
  AutocompleteContent,
  AutocompleteEmpty,
  AutocompleteGroup,
  AutocompleteInput,
  AutocompleteItem,
  AutocompleteLabel,
  AutocompleteList,
  AutocompleteRow,
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
  TooltipPreset,
  TooltipProvider,
} from "@notion-kit/ui/primitives";

interface IconOption {
  value: string;
  keywords: string[];
  icon: React.ReactElement;
}

interface IconGroup {
  label: string;
  items: IconOption[];
}

const iconOptions: IconGroup[] = [
  {
    label: "Direction",
    items: [
      {
        value: "chevron-down",
        keywords: ["arrow", "direction", "expand"],
        icon: <Icon.Chevron side="down" />,
      },
      {
        value: "chevron-up",
        keywords: ["arrow", "direction", "collapse"],
        icon: <Icon.Chevron side="up" />,
      },
      {
        value: "chevron-right",
        keywords: ["arrow", "direction", "next"],
        icon: <Icon.Chevron side="right" />,
      },
      {
        value: "chevron-left",
        keywords: ["arrow", "direction", "back"],
        icon: <Icon.Chevron side="left" />,
      },
      {
        value: "arrow-up",
        keywords: ["direction", "sort", "upload"],
        icon: <Icon.ArrowUp />,
      },
      {
        value: "arrow-down",
        keywords: ["direction", "sort", "download"],
        icon: <Icon.ArrowDown />,
      },
      {
        value: "arrow-up-down",
        keywords: ["sort", "swap", "direction"],
        icon: <Icon.ArrowUpDown />,
      },
      {
        value: "arrow-left-right",
        keywords: ["swap", "direction", "horizontal"],
        icon: <Icon.ArrowLeftRight />,
      },
    ],
  },
  {
    label: "Workspace",
    items: [
      {
        value: "home",
        keywords: ["page", "workspace"],
        icon: <Icon.Home />,
      },
      {
        value: "newspaper",
        keywords: ["page", "document", "news"],
        icon: <Icon.Newspaper />,
      },
      {
        value: "calendar",
        keywords: ["date", "schedule", "view"],
        icon: <Icon.ViewCalendar />,
      },
      {
        value: "table",
        keywords: ["database", "view", "grid"],
        icon: <Icon.ViewTable />,
      },
      {
        value: "board",
        keywords: ["kanban", "view"],
        icon: <Icon.ViewBoard />,
      },
      {
        value: "timeline",
        keywords: ["roadmap", "view"],
        icon: <Icon.ViewTimeline />,
      },
      {
        value: "chart",
        keywords: ["analytics", "view"],
        icon: <Icon.ViewChart />,
      },
      {
        value: "teamspace",
        keywords: ["workspace", "group"],
        icon: <Icon.Teamspace />,
      },
    ],
  },
  {
    label: "Actions",
    items: [
      {
        value: "plus",
        keywords: ["add", "create", "new"],
        icon: <Icon.Plus />,
      },
      {
        value: "copy",
        keywords: ["duplicate", "clone"],
        icon: <Icon.Copy />,
      },
      {
        value: "duplicate",
        keywords: ["copy", "clone"],
        icon: <Icon.Duplicate />,
      },
      {
        value: "trash",
        keywords: ["delete", "remove"],
        icon: <Icon.Trash />,
      },
      {
        value: "archive",
        keywords: ["box", "store"],
        icon: <Icon.ArchiveBox />,
      },
      {
        value: "undo",
        keywords: ["revert", "back"],
        icon: <Icon.Undo />,
      },
      {
        value: "settings",
        keywords: ["gear", "preferences"],
        icon: <Icon.Settings />,
      },
      {
        value: "sliders",
        keywords: ["filter", "controls"],
        icon: <Icon.Sliders />,
      },
    ],
  },
];

function chunk<T>(items: T[], size: number): T[][] {
  const rows: T[][] = [];

  for (let index = 0; index < items.length; index += size) {
    rows.push(items.slice(index, index + size));
  }

  return rows;
}

function getIconStringValue(item: IconOption) {
  return [item.value, ...item.keywords].join(" ");
}

const GRID_COLUMNS = 8;

function GridItem({ item }: { item: IconOption }) {
  return (
    <TooltipPreset key={item.value} description={item.value} side="top">
      <AutocompleteItem
        aria-label={item.value}
        value={item}
        render={
          <Button
            className="size-8 data-highlighted:bg-default/10"
            variant="hint"
          >
            {item.icon}
          </Button>
        }
      />
    </TooltipPreset>
  );
}

export default function AutocompleteGridMenu() {
  return (
    <TooltipProvider>
      <Popover defaultOpen>
        <PopoverTrigger
          render={
            <Button variant="hint" size="sm">
              Open menu
            </Button>
          }
        />
        <PopoverContent>
          <Autocomplete<IconOption>
            items={iconOptions}
            grid
            open
            autoHighlight="always"
            openOnInputClick
            itemToStringValue={getIconStringValue}
          >
            <AutocompleteInput search placeholder="Search icon..." />
            <AutocompleteContent variant="inline">
              <AutocompleteEmpty>No matches found.</AutocompleteEmpty>
              <AutocompleteList>
                {(group: IconGroup) => (
                  <AutocompleteGroup key={group.label} items={group.items}>
                    <AutocompleteLabel title={group.label} />
                    {chunk(group.items, GRID_COLUMNS).map((row, rowIndex) => (
                      <AutocompleteRow key={`${group.label}:${rowIndex}`}>
                        {row.map((item) => (
                          <GridItem item={item} />
                        ))}
                      </AutocompleteRow>
                    ))}
                  </AutocompleteGroup>
                )}
              </AutocompleteList>
            </AutocompleteContent>
          </Autocomplete>
        </PopoverContent>
      </Popover>
    </TooltipProvider>
  );
}
