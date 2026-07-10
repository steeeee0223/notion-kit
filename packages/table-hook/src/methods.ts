import type { Table, Row as TableRow } from "@tanstack/react-table";

import type { Row } from "./lib/types";
import type { CellPlugin, ComparableValue, CompareFn } from "./plugins/types";

export enum CountMethod {
  NONE = "none",
  ALL = "all",
  VALUES = "values",
  UNIQUE = "unique",
  EMPTY = "empty",
  NONEMPTY = "nonempty",
  CHECKED = "checked",
  UNCHECKED = "unchecked",
  PERCENTAGE_CHECKED = "percentage-checked",
  PERCENTAGE_UNCHECKED = "percentage-unchecked",
  PERCENTAGE_EMPTY = "percentage-empty",
  PERCENTAGE_NONEMPTY = "percentage-nonempty",
}

export interface SortingMethod {
  id: string;
  name: string;
  function: (rowA: Row, rowB: Row, colId: string) => number;
}

export interface GroupingMethod<Data = unknown> {
  id: string;
  name: string;
  function: (data: Data, row: Row, colId: string) => ComparableValue;
}

export interface CountingMethodContext {
  table: Table<any, Row>;
  rows: TableRow<any, Row>[];
  colId: string;
  plugin: CellPlugin;
  isCapped?: boolean;
}

export interface CountingMethod {
  id: string;
  name: string;
  function: (context: CountingMethodContext) => string;
}

export interface CountingMethodGroup {
  group: string;
  functions: CountingMethod[];
}

function capValue(num: number, capped?: boolean) {
  return capped && num > 99 ? "99+" : num.toString();
}

function getPercentage(a: number, b: number) {
  if (b === 0) return "0.0%";
  return ((a * 100) / b).toFixed(1) + "%";
}

function toComparableString(value: unknown) {
  return value === null || value === false || typeof value === "undefined"
    ? ""
    : value.toString();
}

function getCellData(row: Row, colId: string) {
  return row.properties[colId]?.value;
}

function createNullableCompareFn<T extends ComparableValue>(
  compare: CompareFn<T>,
): CompareFn<T> {
  return (a, b) => {
    if (a === null || typeof a === "undefined")
      return b === null || typeof b === "undefined" ? 0 : -1;
    if (b === null || typeof b === "undefined") return 1;
    return compare(a as T, b as T);
  };
}

export const compareStrings: CompareFn<string> = (a, b) => a.localeCompare(b);

export const compareNumbers: CompareFn<number> = (a, b) => a - b;

export const compareBooleans: CompareFn<boolean> = (a, b) =>
  Number(a) - Number(b);

export function createSortingMethod<Data extends ComparableValue>(
  id: string,
  name: string,
  compare: CompareFn<Data>,
): SortingMethod {
  const compareValues = createNullableCompareFn(compare);

  return {
    id,
    name,
    function: (rowA, rowB, colId) =>
      compareValues(
        getCellData(rowA, colId) as Data,
        getCellData(rowB, colId) as Data,
      ),
  };
}

export const sortByText = createSortingMethod("text", "Text", compareStrings);

export const sortByNumber = createSortingMethod(
  "number",
  "Number",
  compareNumbers,
);

export const sortByCheckbox = createSortingMethod(
  "checkbox",
  "Checkbox",
  compareBooleans,
);

export const groupByValue: GroupingMethod = {
  id: "value",
  name: "Value",
  function: (data) => data as ComparableValue,
};

export const groupByTextValue: GroupingMethod = {
  id: "text",
  name: "Text",
  function: (data) => toComparableString(data),
};

function getTextValue(plugin: CellPlugin, row: Row, colId: string) {
  return toComparableString(plugin.toValue(row.properties[colId]?.value, row));
}

export const countAll: CountingMethod = {
  id: CountMethod.ALL,
  name: "All",
  function: ({ rows, isCapped }) => capValue(rows.length, isCapped),
};

export const countValues: CountingMethod = {
  id: CountMethod.VALUES,
  name: "Values",
  function: ({ rows, colId, plugin, isCapped }) => {
    const count = rows.reduce(
      (acc, row) =>
        acc +
        getTextValue(plugin, row.original, colId)
          .split(",")
          .filter((v) => !!v.trim()).length,
      0,
    );
    return capValue(count, isCapped);
  },
};

export const countUnique: CountingMethod = {
  id: CountMethod.UNIQUE,
  name: "Unique",
  function: ({ rows, colId, plugin, isCapped }) => {
    const values = rows.reduce((acc, row) => {
      const value = getTextValue(plugin, row.original, colId);
      value.split(",").forEach((v) => {
        if (!v.trim()) return;
        acc.add(v);
      });
      return acc;
    }, new Set<string>());

    return capValue(values.size, isCapped);
  },
};

export const countEmpty: CountingMethod = {
  id: CountMethod.EMPTY,
  name: "Empty",
  function: ({ rows, colId, plugin, isCapped }) => {
    const count = rows.reduce(
      (acc, row) =>
        acc + Number(getTextValue(plugin, row.original, colId) === ""),
      0,
    );
    return capValue(count, isCapped);
  },
};

export const countNonEmpty: CountingMethod = {
  id: CountMethod.NONEMPTY,
  name: "Not empty",
  function: ({ rows, colId, plugin, isCapped }) => {
    const count = rows.reduce(
      (acc, row) =>
        acc + Number(getTextValue(plugin, row.original, colId) !== ""),
      0,
    );
    return capValue(count, isCapped);
  },
};

export const countChecked: CountingMethod = {
  id: CountMethod.CHECKED,
  name: "Checked",
  function: countNonEmpty.function,
};

export const countUnchecked: CountingMethod = {
  id: CountMethod.UNCHECKED,
  name: "Unchecked",
  function: countEmpty.function,
};

export const percentageChecked: CountingMethod = {
  id: CountMethod.PERCENTAGE_CHECKED,
  name: "Checked",
  function: ({ rows, colId, plugin }) => {
    const count = rows.reduce(
      (acc, row) =>
        acc + Number(getTextValue(plugin, row.original, colId) !== ""),
      0,
    );
    return getPercentage(count, rows.length);
  },
};

export const percentageUnchecked: CountingMethod = {
  id: CountMethod.PERCENTAGE_UNCHECKED,
  name: "Unchecked",
  function: ({ rows, colId, plugin }) => {
    const count = rows.reduce(
      (acc, row) =>
        acc + Number(getTextValue(plugin, row.original, colId) === ""),
      0,
    );
    return getPercentage(count, rows.length);
  },
};

export const percentageEmpty: CountingMethod = {
  id: CountMethod.PERCENTAGE_EMPTY,
  name: "Empty",
  function: percentageUnchecked.function,
};

export const percentageNonEmpty: CountingMethod = {
  id: CountMethod.PERCENTAGE_NONEMPTY,
  name: "Not empty",
  function: percentageChecked.function,
};

export function resolveSortingMethod(plugin: CellPlugin) {
  const methods = plugin.sorting?.methods ?? [];
  const method =
    methods.find((item) => item.id === plugin.sorting?.defaultMethod) ??
    methods[0];

  if (method) return method;
  if (!plugin.compare) return undefined;

  return {
    id: "legacy",
    name: "Legacy",
    function: plugin.compare,
  };
}

export function resolveGroupingMethod(plugin: CellPlugin) {
  const methods = plugin.grouping?.methods ?? [];
  const method =
    methods.find((method) => method.id === plugin.grouping?.defaultMethod) ??
    methods[0];

  if (method) return method;

  return {
    id: "legacy",
    name: "Legacy",
    function: (data: unknown, row: Row) =>
      (plugin.toGroupValue ?? plugin.toValue)(data, row),
  };
}

export function resolveCountingMethod(plugin: CellPlugin, methodId: string) {
  return plugin.counting
    ?.flatMap((group) => group.functions)
    .find((method) => method.id === methodId);
}
