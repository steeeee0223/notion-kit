import type { ColumnInfo } from "@notion-kit/table-hook";
import {
  formatDateGroupingLabel,
  type DatePlugin,
  type GroupingValueProps,
} from "@notion-kit/table-hook/plugins";
import { formatDate } from "@notion-kit/utils";

import { DefaultGroupingValue } from "../utils";

export function DateGroupingValue({ value, table }: GroupingValueProps) {
  const column = table.getGroupedColumnInfo() as ColumnInfo<DatePlugin>;

  if (value === null) {
    return <DefaultGroupingValue value={null} table={table} />;
  }

  if (typeof value === "string") {
    const method = table.getSelectedGroupingMethod(column.id);
    return (
      <DefaultGroupingValue
        value={formatDateGroupingLabel(value, method.id, column.config)}
        table={table}
      />
    );
  }

  if (typeof value !== "number" || !Number.isFinite(value)) {
    return <DefaultGroupingValue value={null} table={table} />;
  }

  const date = formatDate(value, {
    dateFormat: column.config.dateFormat,
    timeFormat: column.config.timeFormat,
    tz: column.config.tz,
  });

  return <DefaultGroupingValue value={date} table={table} />;
}
