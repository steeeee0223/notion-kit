import type { FormatOptions } from "@notion-kit/utils";

import type { CellPlugin } from "../types";

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

export type DateConfig = FormatOptions;

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
