import type { CellPlugin, ComparableValue, CompareFn } from "./types";

export type TitlePlugin = CellPlugin<"title", string, { showIcon: boolean }>;
export type TextPlugin = CellPlugin<"text", string, undefined>;
export type NumberPlugin = CellPlugin<"number", number | null, undefined>;
export type CheckboxPlugin = CellPlugin<"checkbox", boolean, undefined>;
export type SelectPlugin = CellPlugin<
  "select",
  { name: string } | null,
  undefined
>;

const emptyIcon = null;

function createCompareFn<T extends ComparableValue>(
  compare: CompareFn<T>,
): CompareFn<T> {
  return (a, b) => {
    if (a === null || a === undefined)
      return b === null || b === undefined ? 0 : -1;
    if (b === null || b === undefined) return 1;
    return compare(a as T, b as T);
  };
}

const compareStrings: CompareFn<string> = (a, b) => a.localeCompare(b);
const compareNumbers: CompareFn<number> = (a, b) => a - b;
const compareBooleans: CompareFn<boolean> = (a, b) => Number(a) - Number(b);

function getCellValue(
  row: Parameters<CellPlugin["compare"]>[0],
  colId: string,
) {
  return row.properties[colId]?.value;
}

export function title(): TitlePlugin {
  return {
    id: "title",
    meta: { name: "Title", desc: "Title", icon: emptyIcon },
    default: {
      name: "Name",
      icon: emptyIcon,
      data: "",
      config: { showIcon: true },
    },
    fromValue: (value) => value?.toString() ?? "",
    toValue: (data) => data,
    toTextValue: (data) => data,
    compare: (rowA, rowB, colId) =>
      createCompareFn(compareStrings)(
        getCellValue(rowA, colId) as string,
        getCellValue(rowB, colId) as string,
      ),
    renderCell: () => null,
  };
}

export function text(): TextPlugin {
  return {
    id: "text",
    meta: { name: "Text", desc: "Text", icon: emptyIcon },
    default: {
      name: "Text",
      icon: emptyIcon,
      data: "",
      config: undefined,
    },
    fromValue: (value) => value?.toString() ?? "",
    toValue: (data) => data,
    toTextValue: (data) => data,
    compare: (rowA, rowB, colId) =>
      createCompareFn(compareStrings)(
        getCellValue(rowA, colId) as string,
        getCellValue(rowB, colId) as string,
      ),
    renderCell: () => null,
  };
}

export function checkbox(): CheckboxPlugin {
  return {
    id: "checkbox",
    meta: { name: "Checkbox", desc: "Checkbox", icon: emptyIcon },
    default: {
      name: "Checkbox",
      icon: emptyIcon,
      data: false,
      config: undefined,
    },
    fromValue: (value) => Boolean(value),
    toValue: (data) => data,
    toTextValue: (data) => (data ? "v" : ""),
    compare: (rowA, rowB, colId) =>
      createCompareFn(compareBooleans)(
        getCellValue(rowA, colId) as boolean,
        getCellValue(rowB, colId) as boolean,
      ),
    renderCell: () => null,
  };
}

export function number(): NumberPlugin {
  return {
    id: "number",
    meta: { name: "Number", desc: "Number", icon: emptyIcon },
    default: {
      name: "Number",
      icon: emptyIcon,
      data: null,
      config: undefined,
    },
    fromValue: (value) => (typeof value === "number" ? value : Number(value)),
    toValue: (data) => data,
    toTextValue: (data) => data?.toString() ?? "",
    compare: (rowA, rowB, colId) =>
      createCompareFn(compareNumbers)(
        getCellValue(rowA, colId) as number,
        getCellValue(rowB, colId) as number,
      ),
    renderCell: () => null,
  };
}

export function select(): SelectPlugin {
  return {
    id: "select",
    meta: { name: "Select", desc: "Select", icon: emptyIcon },
    default: {
      name: "Select",
      icon: emptyIcon,
      data: null,
      config: undefined,
    },
    fromValue: (value) => (value ? { name: value.toString() } : null),
    toValue: (data) => data?.name ?? null,
    toTextValue: (data) => data?.name ?? "",
    compare: (rowA, rowB, colId) =>
      createCompareFn(compareStrings)(
        ((getCellValue(rowA, colId) as { name?: string } | null)?.name ??
          "") as string,
        ((getCellValue(rowB, colId) as { name?: string } | null)?.name ??
          "") as string,
      ),
    renderCell: () => null,
  };
}

export const DEFAULT_PLUGINS = [
  title(),
  text(),
  number(),
  checkbox(),
  select(),
];

export type DefaultPlugins = (typeof DEFAULT_PLUGINS)[number][];
export type * from "./types";
export { DefaultGroupingValue } from "./utils";
