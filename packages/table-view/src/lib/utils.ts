import { v4 } from "uuid";

import type { TableViewCtx } from "../table-contexts";
import type { CellDataType, CellType, Option, PropertyType } from "./types";
import { CountMethod } from "./types";

export function insertAt<T>(array: T[], item: T, index: number) {
  return [...array.slice(0, index), item, ...array.slice(index)];
}

export function getDefaultCell(type: PropertyType): CellDataType {
  switch (type) {
    case "checkbox":
      return { type, id: v4(), checked: false };
    case "select":
      return { type, id: v4(), select: null };
    default:
      return { type, id: v4(), value: "" };
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

export function transferPropertyValues(
  src: CellDataType,
  dest: PropertyType,
): CellDataType {
  switch (dest) {
    case "title":
    case "text":
      return { type: dest, id: src.id, value: toTextValue(src) };
    case "checkbox":
      return { type: dest, id: src.id, checked: toCheckboxValue(src) };
    case "select":
      return { type: dest, id: src.id, select: toSelectValue(src) };
  }
}

function toTextValue(src: CellType): string {
  switch (src.type) {
    case "text":
      return src.value;
    case "select":
      return src.select?.name ?? "";
    default:
      return "";
  }
}

function toCheckboxValue(src: CellType): boolean {
  switch (src.type) {
    case "checkbox":
      return src.checked;
    default:
      return false;
  }
}

function toSelectValue(src: CellType): Option | null {
  switch (src.type) {
    case "select":
      return src.select;
    default:
      return null;
  }
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
      const values = new Set(columnData.map((c) => toTextValue(c)));
      return capValue(values.size, capped);
    }
    case CountMethod.EMPTY: {
      const count = columnData.reduce(
        (acc, c) => acc + Number(toTextValue(c) === ""),
        0,
      );
      return capValue(count, capped);
    }
    case CountMethod.VALUES:
    case CountMethod.NONEMPTY: {
      const count = columnData.reduce(
        (acc, c) => acc + Number(toTextValue(c) !== ""),
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
        (acc, c) => acc + Number(toTextValue(c) === ""),
        0,
      );
      return getPercentage(count, columnData.length);
    }
    case CountMethod.PERCENTAGE_NONEMPTY: {
      const count = columnData.reduce(
        (acc, c) => acc + Number(toTextValue(c) !== ""),
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
