"use client";

import { useState } from "react";

import {
  Calendar,
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuTrigger,
  Input,
  MenuGroup,
  MenuItem,
  MenuItemAction,
  MenuItemSelect,
  Separator,
  Switch,
} from "@notion-kit/shadcn";
import { formatDate } from "@notion-kit/utils";

export interface Data {
  start?: number; // ts in ms
  end?: number; // ts in ms
  showTime?: boolean;
}
export interface DataOptions {
  endDate?: boolean;
  dateFormat: Config["dateFormat"];
  includeTime?: boolean;
}
export interface Config {
  dateFormat:
    | "full"
    | "short"
    | "MM/dd/yyyy"
    | "dd/MM/yyyy"
    | "yyyy/MM/dd"
    | "relative"; // tmp
  timeFormat: "12-hour" | "24-hour";
  tz: string; // GMT
}

export function DateTimePicker() {
  const [data, setData] = useState<Data>({});
  const [options, setOptions] = useState<DataOptions>({
    dateFormat: "full",
  });

  return (
    <div className="flex w-62 flex-col gap-2">
      <div className="flex h-8 gap-3 p-2">
        <Input
          value={data.start ? formatDate(data.start, options.dateFormat) : ""}
        />
        {options.endDate && (
          <Input
            value={data.end ? formatDate(data.end, options.dateFormat) : ""}
          />
        )}
      </div>
      <Calendar
        mode="range"
        defaultMonth={data.start ? new Date(data.start) : undefined}
        selected={{
          from: data.start ? new Date(data.start) : undefined,
          to: data.end ? new Date(data.end) : undefined,
        }}
        onSelect={(selected) => {
          setData((prev) => ({
            start:
              selected?.from !== undefined
                ? selected.from.getTime()
                : prev.start,
            end: selected?.to !== undefined ? selected.to.getTime() : prev.end,
          }));
        }}
      />
      <Separator />
      <MenuGroup>
        <MenuItem
          Body="End date"
          onClick={() =>
            setOptions((prev) => ({ ...prev, endDate: !prev.endDate }))
          }
        >
          <MenuItemAction>
            <Switch size="sm" checked={options.endDate} />
          </MenuItemAction>
        </MenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <MenuItem Body="Date format">
              <MenuItemSelect>{options.dateFormat}</MenuItemSelect>
            </MenuItem>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuGroup>
              <DropdownMenuCheckboxItem
                Body="Full date"
                onCheckedChange={() =>
                  setOptions((prev) => ({ ...prev, dateFormat: "full" }))
                }
              />
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
        <MenuItem
          Body="Include time"
          onClick={() =>
            setOptions((prev) => ({ ...prev, includeTime: !prev.includeTime }))
          }
        >
          <MenuItemAction>
            <Switch size="sm" checked={options.includeTime} />
          </MenuItemAction>
        </MenuItem>
      </MenuGroup>
      <Separator />
      <MenuGroup>
        <MenuItem Body="Clear" />
      </MenuGroup>
    </div>
  );
}
