"use client";

import { useState } from "react";

import {
  Calendar,
  Input,
  MenuGroup,
  MenuItem,
  MenuItemSwitch,
  Separator,
} from "@notion-kit/shadcn";
import { formatDate } from "@notion-kit/utils";

import { DateFormatMenu, TimeFormatMenu } from "../common";
import { DateConfig, DateData } from "../types";

export interface DataOptions {
  endDate?: boolean;
  includeTime?: boolean;
}

export function DateTimePicker() {
  const [data, setData] = useState<DateData>({});
  const [options, setOptions] = useState<DataOptions>({});
  const [config, setConfig] = useState<DateConfig>({
    dateFormat: "full",
    timeFormat: "12-hour",
    tz: "GMT",
  });

  return (
    <div className="flex w-62 flex-col gap-2">
      <div className="flex h-8 gap-3 p-2">
        <Input
          value={data.start ? formatDate(data.start, "_display_mode") : ""}
        />
        {options.endDate && (
          <Input
            value={data.end ? formatDate(data.end, "_display_mode") : ""}
          />
        )}
      </div>
      {options.endDate ? (
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
              end:
                selected?.to !== undefined ? selected.to.getTime() : prev.end,
            }));
          }}
        />
      ) : (
        <Calendar
          mode="single"
          defaultMonth={data.start ? new Date(data.start) : undefined}
          selected={data.start ? new Date(data.start) : undefined}
          onSelect={(selected) => {
            setData((prev) => ({
              start: selected !== undefined ? selected.getTime() : prev.start,
            }));
          }}
        />
      )}
      <Separator />
      <MenuGroup>
        <MenuItemSwitch
          Body="End date"
          checked={options.endDate}
          onCheckedChange={() => {
            setOptions((prev) => ({ ...prev, endDate: !prev.endDate }));
            setData((prev) => ({ ...prev, end: undefined }));
          }}
        />
        <DateFormatMenu
          format={config.dateFormat}
          onChange={(dateFormat) =>
            setConfig((prev) => ({ ...prev, dateFormat }))
          }
        />
        <MenuItemSwitch
          Body="Include time"
          checked={options.includeTime}
          onCheckedChange={() =>
            setOptions((prev) => ({
              ...prev,
              includeTime: !prev.includeTime,
            }))
          }
        />
        {options.includeTime && (
          <TimeFormatMenu
            format={config.timeFormat}
            onChange={(timeFormat) =>
              setConfig((prev) => ({ ...prev, timeFormat }))
            }
          />
        )}
      </MenuGroup>
      <Separator />
      <MenuGroup>
        <MenuItem
          Body="Clear"
          onClick={() =>
            setData((prev) => ({ ...prev, start: undefined, end: undefined }))
          }
        />
      </MenuGroup>
    </div>
  );
}
