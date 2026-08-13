import { v4 } from "uuid";

import { cn } from "@notion-kit/cn";
import type { CellPlugin, InferData } from "@notion-kit/table-hook/plugins";

import type { _TableInstance } from "@/features/types";
import type { Cell } from "@/lib/types";
import { resolveCountingMethod } from "@/methods";

export interface Entity<T extends { id: string }> {
  ids: string[];
  items: Record<string, T>;
}

export function arrayToEntity<T extends { id: string }>(array: T[]) {
  return array.reduce<Entity<T>>(
    (acc, item) => {
      acc.ids.push(item.id);
      acc.items[item.id] = item;
      return acc;
    },
    { ids: [], items: {} },
  );
}

export function insertAt<T>(array: T[], item: T, index: number) {
  return [...array.slice(0, index), item, ...array.slice(index)];
}

export function getDefaultCell<TPlugin extends CellPlugin>(
  plugin: TPlugin,
): Cell<TPlugin> {
  return {
    id: v4(),
    value: plugin.default.data as InferData<TPlugin>,
  };
}

export function getUniqueName(name: string, names: string[]) {
  const namesSet = new Set(names);
  let uniqueName = name;
  let suffix = 1;

  while (namesSet.has(uniqueName)) {
    uniqueName = `${name} ${suffix}`;
    suffix++;
  }
  return uniqueName;
}

export function getCount(table: _TableInstance, colId: string): string {
  const { isCapped, method } = table.getColumnCounting(colId);
  if (method === "none") return "";

  const plugin = table.getColumnPlugin(colId);
  const rows = getCalculationRows(table);
  const countingMethod = resolveCountingMethod(plugin, method);
  if (!countingMethod) return "";

  const context = { table, rows, colId, plugin, isCapped };
  if (countingMethod.aggregationFn) {
    const result = table
      .getColumn(colId)
      ?.getAggregationValue({ rows, maxDepth: 0 });
    if (countingMethod.formatResult) {
      return countingMethod.formatResult(result, context);
    }
    return typeof result === "string" ||
      typeof result === "number" ||
      typeof result === "boolean"
      ? String(result)
      : "";
  }

  return countingMethod.function?.(context) ?? "";
}

export function getCalculationRows(table: _TableInstance) {
  return table.getPreGroupedRowModel().rows;
}

export function wrappedClassName(wrapped?: boolean) {
  return cn(
    wrapped
      ? "wrap-break-word whitespace-pre-wrap"
      : "break-normal whitespace-nowrap",
  );
}
