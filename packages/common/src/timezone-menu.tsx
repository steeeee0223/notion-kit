"use client";

import React from "react";
import { tzOffset } from "@date-fns/tz";

import { cn } from "@notion-kit/cn";
import { useFilter } from "@notion-kit/hooks";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  MenuItem,
  MenuItemCheck,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@notion-kit/shadcn";

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
  const { search, results, updateSearch } = useFilter(
    Intl.supportedValuesOf("timeZone"),
    (tz, v) => tz.toLowerCase().includes(v),
  );

  return (
    <Popover>
      <PopoverTrigger asChild>
        {renderTrigger({ tz: defaultTz, gmt: getGmtStr(defaultTz) })}
      </PopoverTrigger>
      <PopoverContent className={cn("w-[342px]", className)}>
        <Command shouldFilter={false}>
          <CommandInput
            value={search}
            onValueChange={updateSearch}
            placeholder={"Search cities, timezones..."}
          />
          <CommandList className="max-h-100 overflow-y-auto">
            <CommandGroup
              className={cn(
                "flex flex-col gap-px px-0",
                "**:[[cmdk-group-heading]]:mt-1.5 **:[[cmdk-group-heading]]:mb-2 **:[[cmdk-group-heading]]:flex **:[[cmdk-group-heading]]:items-center **:[[cmdk-group-heading]]:truncate **:[[cmdk-group-heading]]:px-3.5 **:[[cmdk-group-heading]]:py-0 **:[[cmdk-group-heading]]:leading-tight **:[[cmdk-group-heading]]:text-secondary **:[[cmdk-group-heading]]:select-none",
              )}
              heading="Current timezone"
            >
              <TzItem checked tz={defaultTz} onSelect={onChange} />
            </CommandGroup>
            {results && results.length > 0 && (
              <CommandGroup
                className={cn(
                  "flex flex-col gap-px px-0",
                  "**:[[cmdk-group-heading]]:mt-1.5 **:[[cmdk-group-heading]]:mb-2 **:[[cmdk-group-heading]]:flex **:[[cmdk-group-heading]]:items-center **:[[cmdk-group-heading]]:truncate **:[[cmdk-group-heading]]:px-3.5 **:[[cmdk-group-heading]]:py-0 **:[[cmdk-group-heading]]:leading-tight **:[[cmdk-group-heading]]:text-secondary **:[[cmdk-group-heading]]:select-none",
                )}
                heading="Select a timezone"
              >
                {results.map((tz) => {
                  if (tz === defaultTz) return null;
                  return <TzItem key={tz} tz={tz} onSelect={onChange} />;
                })}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
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
    <CommandItem asChild value={tz} onSelect={onSelect}>
      <MenuItem
        className="h-11"
        Body={
          <div className="flex flex-col gap-0.5 p-1">
            <div className="truncate">{tz.replace("_", " ")}</div>
            <div className="truncate text-xs text-secondary">
              {getGmtStr(tz)}
            </div>
          </div>
        }
      >
        {checked && <MenuItemCheck />}
      </MenuItem>
    </CommandItem>
  );
}

function getGmtStr(tz: string): string {
  const num = Math.round(tzOffset(tz, new Date()) / 60);
  return num === 0 ? "GMT" : `GMT${num > 0 ? "+" : ""}${num}:00`;
}
