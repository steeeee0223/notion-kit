import type { Updater } from "@tanstack/react-table";
import { v4 } from "uuid";

import type { TableViewCtx } from "../table-contexts";
import { toCheckboxValue, toReadableValue } from "./data-transfer";
import type {
  CellDataType,
  ConfigMeta,
  DatabaseProperty,
  PropertyType,
} from "./types";
import { CountMethod } from "./types";

interface Entity<T extends { id: string }> {
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

export function getDefaultCell(type: PropertyType): CellDataType {
  switch (type) {
    case "checkbox":
      return { type, id: v4(), checked: false };
    case "select":
      return { type, id: v4(), option: null };
    case "multi-select":
      return { type, id: v4(), options: [] };
    default:
      return { type, id: v4(), value: "" };
  }
}

export function getDefaultPropConfig(
  type: PropertyType,
): ConfigMeta<typeof type> {
  switch (type) {
    case "title":
      return { type, config: { showIcon: true } };
    case "select":
    case "multi-select":
      return {
        type,
        config: {
          options: { names: [], items: {} },
          sort: "manual",
        },
      };
    default:
      return { type, config: undefined as never };
  }
}

export function extractPropConfig(
  prop: DatabaseProperty,
): ConfigMeta<typeof prop.type> {
  switch (prop.type) {
    case "title":
      return { type: prop.type, config: prop.config };
    case "select":
    case "multi-select":
      return { type: prop.type, config: prop.config };
    default:
      return { type: prop.type, config: undefined as never };
  }
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

export function getCount(
  ctx: Pick<TableViewCtx, "table" | "properties">,
  colId: string,
  method: CountMethod,
): string {
  const columnData = ctx.table
    .getCoreRowModel()
    .rows.map((r) => r.original.properties[colId]!);
  const capped = ctx.properties[colId]!.isCountCapped;

  switch (method) {
    case CountMethod.ALL:
      return capValue(columnData.length, capped);
    case CountMethod.UNIQUE: {
      const values = new Set(columnData.map((c) => toReadableValue(c)));
      return capValue(values.size, capped);
    }
    case CountMethod.EMPTY: {
      const count = columnData.reduce(
        (acc, c) => acc + Number(toReadableValue(c) === ""),
        0,
      );
      return capValue(count, capped);
    }
    case CountMethod.VALUES:
    case CountMethod.NONEMPTY: {
      const count = columnData.reduce(
        (acc, c) => acc + Number(toReadableValue(c) !== ""),
        0,
      );
      return capValue(count, capped);
    }
    case CountMethod.CHECKED: {
      const count = columnData.reduce(
        (acc, c) => acc + Number(toCheckboxValue(c)),
        0,
      );
      return capValue(count, capped);
    }
    case CountMethod.UNCHECKED: {
      const count = columnData.reduce(
        (acc, c) => acc + Number(!toCheckboxValue(c)),
        0,
      );
      return capValue(count, capped);
    }
    case CountMethod.PERCENTAGE_EMPTY: {
      const count = columnData.reduce(
        (acc, c) => acc + Number(toReadableValue(c) === ""),
        0,
      );
      return getPercentage(count, columnData.length);
    }
    case CountMethod.PERCENTAGE_NONEMPTY: {
      const count = columnData.reduce(
        (acc, c) => acc + Number(toReadableValue(c) !== ""),
        0,
      );
      return getPercentage(count, columnData.length);
    }
    case CountMethod.PERCENTAGE_CHECKED: {
      const count = columnData.reduce(
        (acc, c) => acc + Number(toCheckboxValue(c)),
        0,
      );
      return getPercentage(count, columnData.length);
    }
    case CountMethod.PERCENTAGE_UNCHECKED: {
      const count = columnData.reduce(
        (acc, c) => acc + Number(!toCheckboxValue(c)),
        0,
      );
      return getPercentage(count, columnData.length);
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

export function isCountMethodSet(properties: TableViewCtx["properties"]) {
  return Object.values(properties).some(
    (p) => p.countMethod !== undefined && p.countMethod !== CountMethod.NONE,
  );
}

export function getState<T>(updater: Updater<T>, snapshot: T) {
  return typeof updater === "function"
    ? (updater as (old: T) => T)(snapshot)
    : updater;
}
