import type { DateFormat } from "@notion-kit/utils";

import type { CellPlugin } from "../types";

export type TimeFormat = "hidden" | "12-hour" | "24-hour";

export interface DateData {
  /**
   * @prop timestamp in milliseconds
   */
  start?: number;
  /**
   * @prop timestamp in milliseconds
   */
  end?: number;
}

export interface DateConfig {
  dateFormat: DateFormat;
  timeFormat: TimeFormat;
  /**
   * @prop GMT timezone string, e.g. "GMT+8", "GMT-5"
   */
  tz: string;
}

export type DatePlugin = CellPlugin<"date", DateData, DateConfig>;
export type CreatedTimePlugin = CellPlugin<
  "created-time",
  number | null,
  DateConfig
>;
export type LastEditedTimePlugin = CellPlugin<
  "last-edited-time",
  number | null,
  DateConfig
>;
