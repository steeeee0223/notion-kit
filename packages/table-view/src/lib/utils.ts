import type { Updater } from "@tanstack/react-table";
import { v4 } from "uuid";

import { CountMethod } from "../features";
import type { CellPlugin, InferData } from "../plugins";
import type { TableViewCtx } from "../table-contexts";
import type { Cell, Column, ColumnConfig } from "./types";

export const NEVER = undefined as never;

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

export function extractColumnConfig<TPlugin>(
  prop: Column<TPlugin>,
): ColumnConfig<TPlugin> {
  return { type: prop.type, config: prop.config };
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

export function getCount<TPlugin extends CellPlugin>(
  ctx: Pick<TableViewCtx, "table" | "properties">,
  colId: string,
  plugin: TPlugin,
  method: CountMethod,
): string {
  const cells = ctx.table
    .getCoreRowModel()
    .rows.map((r) => r.original.properties[colId]!);
  const capped = ctx.properties[colId]!.isCountCapped;

  switch (method) {
    case CountMethod.ALL:
      return capValue(cells.length, capped);
    case CountMethod.UNIQUE: {
      const values = cells.reduce((acc, c) => {
        plugin
          .toReadableValue(c.value)
          .split(",")
          .forEach((v) => {
            if (!v.trim()) return;
            acc.add(v);
          });
        return acc;
      }, new Set());
      return capValue(values.size, capped);
    }
    case CountMethod.EMPTY:
    case CountMethod.UNCHECKED: {
      // the readable value of a checkbox plugin is "" or "v"
      const count = cells.reduce(
        (acc, c) => acc + Number(plugin.toReadableValue(c.value) === ""),
        0,
      );
      return capValue(count, capped);
    }
    case CountMethod.NONEMPTY:
    case CountMethod.CHECKED: {
      // the readable value of a checkbox plugin is "" or "v"
      const count = cells.reduce(
        (acc, c) => acc + Number(plugin.toReadableValue(c.value) !== ""),
        0,
      );
      return capValue(count, capped);
    }
    case CountMethod.VALUES: {
      const count = cells.reduce(
        (acc, c) =>
          acc +
          plugin
            .toReadableValue(c.value)
            .split(",")
            .filter((v) => !!v.trim()).length,
        0,
      );
      return capValue(count, capped);
    }
    case CountMethod.PERCENTAGE_EMPTY:
    case CountMethod.PERCENTAGE_UNCHECKED: {
      const count = cells.reduce(
        (acc, c) => acc + Number(plugin.toReadableValue(c.value) === ""),
        0,
      );
      return getPercentage(count, cells.length);
    }
    case CountMethod.PERCENTAGE_NONEMPTY:
    case CountMethod.PERCENTAGE_CHECKED: {
      const count = cells.reduce(
        (acc, c) => acc + Number(plugin.toReadableValue(c.value) !== ""),
        0,
      );
      return getPercentage(count, cells.length);
    }
    default:
      // no op
      return "";
  }
}

function capValue(num: number, capped?: boolean) {
  return capped && num > 99 ? "99+" : num.toString();
}

function getPercentage(a: number, b: number) {
  return ((a * 100) / b).toFixed(1) + "%";
}

export function getState<T>(updater: Updater<T>, snapshot: T) {
  return typeof updater === "function"
    ? (updater as (old: T) => T)(snapshot)
    : updater;
}
