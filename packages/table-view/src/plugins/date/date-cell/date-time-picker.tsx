"use client";

import { TimezoneMenu } from "@notion-kit/common";
import {
  Calendar,
  MenuGroup,
  MenuItem,
  MenuItemSelect,
  MenuItemSwitch,
  Separator,
} from "@notion-kit/shadcn";

import type { InferCellProps } from "../../types";
import { DateFormatMenu, TimeFormatMenu } from "../common";
import type { DatePlugin } from "../types";
import { DateRangeInput } from "./date-range-input";

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
  return (
    <div className="flex w-62 flex-col">
      <DateRangeInput className="pb-0" value={data} onChange={onChange} />
      {data.endDate ? (
        <Calendar
          mode="range"
          defaultMonth={data.start ? new Date(data.start) : undefined}
          selected={{
            from: data.start ? new Date(data.start) : undefined,
            to: data.end ? new Date(data.end) : undefined,
          }}
          onSelect={(selected) => {
            onChange((v) => ({
              ...v,
              start:
                selected?.from !== undefined
                  ? selected.from.getTime()
                  : v.start,
              end: selected?.to !== undefined ? selected.to.getTime() : v.end,
            }));
          }}
        />
      ) : (
        <Calendar
          mode="single"
          defaultMonth={data.start ? new Date(data.start) : undefined}
          selected={data.start ? new Date(data.start) : undefined}
          onSelect={(selected) => {
            onChange((v) => ({
              ...v,
              start: selected !== undefined ? selected.getTime() : v.start,
              end: undefined,
            }));
          }}
        />
      )}
      <Separator />
      <MenuGroup>
        <MenuItemSwitch
          Body="End date"
          checked={data.endDate}
          onCheckedChange={(checked) =>
            onChange((v) => ({
              ...v,
              end: undefined,
              endDate: checked,
            }))
          }
        />
        <DateFormatMenu
          format={config.dateFormat}
          onChange={(dateFormat) =>
            onConfigChange?.((v) => ({ ...v, dateFormat }))
          }
        />
        <MenuItemSwitch
          Body="Include time"
          checked={data.includeTime}
          onCheckedChange={(checked) => {
            onConfigChange?.((v) => ({
              ...v,
              // timeFormat: checked ? "12-hour" : "hidden",
            }));
            onChange((v) => ({ ...v, includeTime: checked }));
          }}
        />
        {data.includeTime && (
          <>
            <TimeFormatMenu
              format={config.timeFormat}
              onChange={(timeFormat) =>
                onConfigChange?.((v) => ({ ...v, timeFormat }))
              }
            />
            <TimezoneMenu
              currentTz={config.tz}
              onChange={(tz) => onConfigChange?.((v) => ({ ...v, tz }))}
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
        <MenuItem
          Body="Clear"
          onClick={() =>
            onChange((v) => ({ ...v, start: undefined, end: undefined }))
          }
        />
      </MenuGroup>
    </div>
  );
}
