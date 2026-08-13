import type { ColumnInfo } from "@notion-kit/table-hook";
import {
  formatNumber,
  type GroupingValueProps,
  type NumberPlugin,
} from "@notion-kit/table-hook/plugins";

import { DefaultGroupingValue } from "../utils";

export function NumberGroupingValue({ value, table }: GroupingValueProps) {
  if (typeof value !== "number") {
    return <DefaultGroupingValue value="" table={table} />;
  }
  const column = table.getGroupedColumnInfo() as ColumnInfo<NumberPlugin>;
  const method = table.getSelectedGroupingMethod(column.id);
  const interval = Number(method.id.replace("interval-", ""));
  const label = `${formatNumber(value, column.config)} – ${formatNumber(
    value + interval,
    column.config,
  )}`;
  return <DefaultGroupingValue value={label} table={table} />;
}
