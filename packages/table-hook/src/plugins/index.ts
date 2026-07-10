import {
  countAll,
  countChecked,
  countEmpty,
  countNonEmpty,
  countUnchecked,
  countUnique,
  countValues,
  groupByTextValue,
  groupByValue,
  percentageChecked,
  percentageEmpty,
  percentageNonEmpty,
  percentageUnchecked,
  sortByCheckbox,
  sortByNumber,
  sortByText,
} from "../methods";
import type { CellPlugin } from "./types";

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

const genericCounting = [
  {
    group: "Count",
    functions: [countAll, countValues, countUnique, countEmpty, countNonEmpty],
  },
  {
    group: "Percentage",
    functions: [percentageEmpty, percentageNonEmpty],
  },
];

const checkboxCounting = [
  {
    group: "Count",
    functions: [countAll, countChecked, countUnchecked],
  },
  {
    group: "Percentage",
    functions: [percentageChecked, percentageUnchecked],
  },
];

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
    sorting: {
      defaultMethod: sortByText.id,
      methods: [sortByText],
    },
    grouping: {
      defaultMethod: groupByTextValue.id,
      methods: [groupByTextValue],
    },
    counting: genericCounting,
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
    sorting: {
      defaultMethod: sortByText.id,
      methods: [sortByText],
    },
    grouping: {
      defaultMethod: groupByTextValue.id,
      methods: [groupByTextValue],
    },
    counting: genericCounting,
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
    sorting: {
      defaultMethod: sortByCheckbox.id,
      methods: [sortByCheckbox],
    },
    grouping: {
      defaultMethod: groupByValue.id,
      methods: [groupByValue],
    },
    counting: checkboxCounting,
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
    sorting: {
      defaultMethod: sortByNumber.id,
      methods: [sortByNumber],
    },
    grouping: {
      defaultMethod: groupByValue.id,
      methods: [groupByValue],
    },
    counting: genericCounting,
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
    sorting: {
      defaultMethod: sortByText.id,
      methods: [
        {
          ...sortByText,
          function: (rowA, rowB, colId) => {
            const valueA =
              (rowA.properties[colId]?.value as { name?: string } | null)
                ?.name ?? "";
            const valueB =
              (rowB.properties[colId]?.value as { name?: string } | null)
                ?.name ?? "";
            return valueA.localeCompare(valueB);
          },
        },
      ],
    },
    grouping: {
      defaultMethod: groupByTextValue.id,
      methods: [
        {
          ...groupByTextValue,
          function: (data) => data?.name ?? "",
        },
      ],
    },
    counting: genericCounting,
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
