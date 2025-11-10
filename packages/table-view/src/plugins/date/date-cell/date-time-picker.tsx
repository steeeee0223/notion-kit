"use client";

import { useState } from "react";

import { TimezoneMenu } from "@notion-kit/common";
import {
  Calendar,
  Input,
  MenuGroup,
  MenuItem,
  MenuItemSelect,
  MenuItemSwitch,
  Separator,
} from "@notion-kit/shadcn";
import { formatDate, type FormatOptions } from "@notion-kit/utils";

import type { InferCellProps } from "../../types";
import { DateFormatMenu, TimeFormatMenu } from "../common";
import type { DatePlugin } from "../types";

interface DataOptions {
  endDate?: boolean;
  includeTime?: boolean;
}

type DateTimePickerProps = Pick<
  InferCellProps<DatePlugin>,
  "data" | "config" | "onChange" | "onConfigChange"
>;

export function DateTimePicker({
  data,
  config,
  onChange,
  onConfigChange,
}: DateTimePickerProps) {
  const [options, setOptions] = useState<DataOptions>({});

  const inputOptions: FormatOptions = {
    dateFormat: "_edit_mode",
    timeFormat: "_edit_mode",
    tz: config.tz,
  };

  return (
    <div className="flex w-62 flex-col gap-2">
      <div className="flex h-8 gap-3 p-2">
        <Input value={data.start ? formatDate(data.start, inputOptions) : ""} />
        {options.endDate && (
          <Input value={data.end ? formatDate(data.end, inputOptions) : ""} />
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
            onChange((prev) => ({
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
            onChange((prev) => ({
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
            onChange((prev) => ({ ...prev, end: undefined }));
          }}
        />
        <DateFormatMenu
          format={config.dateFormat}
          onChange={(dateFormat) =>
            onConfigChange?.((prev) => ({ ...prev, dateFormat }))
          }
        />
        <MenuItemSwitch
          Body="Include time"
          checked={options.includeTime}
          onCheckedChange={(checked) => {
            onConfigChange?.((prev) => ({
              ...prev,
              timeFormat: checked ? "12-hour" : "hidden",
            }));
            setOptions((prev) => ({
              ...prev,
              includeTime: !prev.includeTime,
            }));
          }}
        />
        {options.includeTime && (
          <>
            <TimeFormatMenu
              format={config.timeFormat}
              onChange={(timeFormat) =>
                onConfigChange?.((prev) => ({ ...prev, timeFormat }))
              }
            />
            <TimezoneMenu
              currentTz={config.tz}
              onChange={(tz) => onConfigChange?.((prev) => ({ ...prev, tz }))}
              renderTrigger={({ gmt }) => (
                <MenuItem Body="Timezone">
                  <MenuItemSelect>{gmt}</MenuItemSelect>
                </MenuItem>
              )}
            />
          </>
        )}
      </MenuGroup>
      <Separator />
      <MenuGroup>
        <MenuItem Body="Clear" onClick={() => onChange({})} />
      </MenuGroup>
    </div>
  );
}
