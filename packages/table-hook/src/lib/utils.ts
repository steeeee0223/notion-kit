import { v4 } from "uuid";

import { cn } from "@notion-kit/cn";

import type { _TableInstance } from "@/features/types";
import type { Cell } from "@/lib/types";
import { resolveCountingMethod } from "@/methods";
import type { CellPlugin, InferData } from "@/plugins";

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
  const rows = table.getCoreRowModel().rows;
  const countingMethod = resolveCountingMethod(plugin, method);

  return (
    countingMethod?.function({
      table,
      rows,
      colId,
      plugin,
      isCapped,
    }) ?? ""
  );
}

export function wrappedClassName(wrapped?: boolean) {
  return cn(
    wrapped
      ? "wrap-break-word whitespace-pre-wrap"
      : "break-normal whitespace-nowrap",
  );
}
