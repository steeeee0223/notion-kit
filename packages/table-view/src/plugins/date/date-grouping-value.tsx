import { formatDate } from "@notion-kit/utils";

import type { ColumnInfo } from "../../lib/types";
import type { GroupingValueProps } from "../types";
import { DefaultGroupingValue } from "../utils";
import type { DatePlugin } from "./types";

export function DateGroupingValue({ value, table }: GroupingValueProps) {
  const column = table.getGroupedColumnInfo() as ColumnInfo<DatePlugin>;

  const date = formatDate(value as number, {
    dateFormat: column.config.dateFormat,
    timeFormat: column.config.timeFormat,
    tz: column.config.tz,
  });

  return <DefaultGroupingValue value={date} table={table} />;
}
