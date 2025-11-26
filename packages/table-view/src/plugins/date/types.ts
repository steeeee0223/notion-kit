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
  /**
   * @prop should include end date(time)
   */
  endDate?: boolean;
  /**
   * @prop should include time
   */
  includeTime?: boolean;
}

export type DateConfig = FormatOptions;

export type DatePlugin = CellPlugin<"date", DateData, DateConfig>;
export type CreatedTimePlugin = CellPlugin<"created-time", null, DateConfig>;
export type LastEditedTimePlugin = CellPlugin<
  "last-edited-time",
  null,
  DateConfig
>;
