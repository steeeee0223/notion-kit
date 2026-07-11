import {
  DefaultGroupingValue,
  type ColumnInfo,
  type GroupingValueProps,
} from "@notion-kit/table-hook";
import { formatDate } from "@notion-kit/utils";

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
