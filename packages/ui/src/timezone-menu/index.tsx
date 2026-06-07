"use client";

import React from "react";
import { tzOffset } from "@date-fns/tz";

import { cn } from "@notion-kit/cn";

import {
  Autocomplete,
  AutocompleteCollection,
  AutocompleteContent,
  AutocompleteGroup,
  AutocompleteInput,
  AutocompleteItem,
  AutocompleteLabel,
  AutocompleteList,
  MenuItemCheck,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/primitives";

interface TimezoneMenuProps extends React.PropsWithChildren {
  className?: string;
  /**
   * @prop timezone
   * @example Asia/Taipei
   */
  currentTz?: string;
  onChange: (tz: string) => void;
  renderTrigger: (props: { tz: string; gmt: string }) => React.ReactNode;
}

export function TimezoneMenu({
  className,
  currentTz,
  onChange,
  renderTrigger,
}: TimezoneMenuProps) {
  const defaultTz =
    currentTz ?? Intl.DateTimeFormat().resolvedOptions().timeZone;
  const timezones = React.useMemo(
    () => Intl.supportedValuesOf("timeZone"),
    [],
  );
  const timezoneGroups = React.useMemo(
    () => [
      { label: "Current timezone", items: [defaultTz] },
      {
        label: "Select a timezone",
        items: timezones.filter((tz) => tz !== defaultTz),
      },
    ],
    [defaultTz, timezones],
  );

  return (
    <Popover>
      <PopoverTrigger asChild>
        {renderTrigger({ tz: defaultTz, gmt: getGmtStr(defaultTz) })}
      </PopoverTrigger>
      <PopoverContent className={cn("w-[342px]", className)}>
        <Autocomplete<string>
          items={timezoneGroups}
          itemToStringValue={(tz) => tz}
          open
          autoHighlight="always"
          openOnInputClick
        >
          <AutocompleteInput placeholder="Search cities, timezones..." />
          <AutocompleteContent variant="inline">
            <AutocompleteList className="max-h-100 overflow-y-auto">
              {(group: (typeof timezoneGroups)[number]) => (
                <AutocompleteGroup key={group.label} items={group.items}>
                  <AutocompleteLabel title={group.label} />
                  <AutocompleteCollection>
                    {(tz: string) => (
                      <TzItem
                        key={tz}
                        checked={tz === defaultTz}
                        tz={tz}
                        onSelect={onChange}
                      />
                    )}
                  </AutocompleteCollection>
                </AutocompleteGroup>
              )}
            </AutocompleteList>
          </AutocompleteContent>
        </Autocomplete>
      </PopoverContent>
    </Popover>
  );
}

interface TzItemProps {
  tz: string;
  checked?: boolean;
  onSelect?: (value: string) => void;
}

function TzItem({ tz, checked, onSelect }: TzItemProps) {
  return (
    <AutocompleteItem
      className="h-11"
      value={tz}
      label={tz.replace("_", " ")}
      desc={getGmtStr(tz)}
      onClick={() => onSelect?.(tz)}
    >
      {checked && <MenuItemCheck />}
    </AutocompleteItem>
  );
}

function getGmtStr(tz: string): string {
  const num = Math.round(tzOffset(tz, new Date()) / 60);
  return num === 0 ? "GMT" : `GMT${num > 0 ? "+" : ""}${num}:00`;
}
