"use client";

import { tzOffset } from "@date-fns/tz";
import { ChevronDown } from "lucide-react";

import { cn } from "@notion-kit/cn";
import { useFilter } from "@notion-kit/hooks";
import {
  Button,
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
  Input,
  MenuItem,
  MenuItemCheck,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@notion-kit/shadcn";

interface TimezoneMenuProps {
  currentTz?: string;
  onChange: (tz: string) => void;
}

export function TimezoneMenu({ currentTz, onChange }: TimezoneMenuProps) {
  const defaultTz =
    currentTz ?? Intl.DateTimeFormat().resolvedOptions().timeZone;
  const { search, results, updateSearch } = useFilter(
    Intl.supportedValuesOf("timeZone"),
    (tz, v) => tz.toLowerCase().includes(v),
  );

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="hint"
          className="h-7 p-2 font-normal text-primary"
          disabled={!currentTz}
        >
          {`(${getGmtStr(defaultTz)}) ${defaultTz}`}
          <ChevronDown className="ml-1 text-default/45" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[342px]">
        <Command className="bg-popover">
          <div className="flex min-w-0 flex-auto flex-col px-3 pt-3 pb-2">
            <Input
              value={search}
              onChange={(e) => updateSearch(e.target.value)}
              placeholder={"Search cities, timezones..."}
            />
          </div>
          <CommandList className="max-h-100 overflow-y-auto">
            <CommandGroup
              className={cn(
                "flex flex-col gap-px px-0",
                "[&_[cmdk-group-heading]]:mt-1.5 [&_[cmdk-group-heading]]:mb-2 [&_[cmdk-group-heading]]:flex [&_[cmdk-group-heading]]:items-center [&_[cmdk-group-heading]]:truncate [&_[cmdk-group-heading]]:px-3.5 [&_[cmdk-group-heading]]:py-0 [&_[cmdk-group-heading]]:leading-[1.2] [&_[cmdk-group-heading]]:text-secondary [&_[cmdk-group-heading]]:select-none",
              )}
              heading="Current timezone"
            >
              <TzItem checked tz={defaultTz} onSelect={onChange} />
            </CommandGroup>
            {results && results.length > 0 && (
              <CommandGroup
                className={cn(
                  "flex flex-col gap-px px-0",
                  "[&_[cmdk-group-heading]]:mt-1.5 [&_[cmdk-group-heading]]:mb-2 [&_[cmdk-group-heading]]:flex [&_[cmdk-group-heading]]:items-center [&_[cmdk-group-heading]]:truncate [&_[cmdk-group-heading]]:px-3.5 [&_[cmdk-group-heading]]:py-0 [&_[cmdk-group-heading]]:leading-[1.2] [&_[cmdk-group-heading]]:text-secondary [&_[cmdk-group-heading]]:select-none",
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
