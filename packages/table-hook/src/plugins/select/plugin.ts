import { v4 } from "uuid";

import { getRandomColor } from "@notion-kit/utils";

import { compareEmptyLastStrings, getFirstOption, groupByValue } from "@/fns";
import type { Cell, ColumnInfo, Row } from "@/lib/types";

import type { CellPlugin, ComparableValue } from "../types";
import { compareStrings, createCompareFn, genericCounting } from "../utils";
import type { MultiSelectPlugin, SelectConfig, SelectPlugin } from "./types";

function getDefaultConfig(): SelectConfig {
  return {
    options: { names: [], items: {} },
    sort: "manual",
  };
}

function optionValues(operand: unknown, multiple: boolean) {
  if (!multiple) return typeof operand === "string" ? [operand] : undefined;
  return Array.isArray(operand) &&
    operand.every((value) => typeof value === "string")
    ? operand
    : undefined;
}

function selectFiltering<Data extends string | string[] | null>(
  isEmpty: (data: Data) => boolean,
  multiple = false,
) {
  const values = (data: string | string[] | null | undefined) =>
    Array.isArray(data) ? data : typeof data === "string" ? [data] : [];
  const membershipOperator = (id: string, name: string, invert: boolean) => ({
    id,
    name,
    operand: { kind: "option" as const, ...(multiple && { multiple: true }) },
    matches: (
      data: string | string[] | null | undefined,
      _row: Row,
      _config: SelectConfig,
      operand?: unknown,
    ) => {
      const selected = optionValues(operand, multiple);
      if (!selected?.length) return false;
      const available = values(data);
      return multiple
        ? invert
          ? selected.every((value) => !available.includes(value))
          : selected.every((value) => available.includes(value))
        : invert
          ? !available.includes(selected[0]!)
          : available.includes(selected[0]!);
    },
  });
  return {
    filtering: {
      operators: [
        membershipOperator("contains", multiple ? "Contains" : "Is", false),
        membershipOperator(
          "does-not-contain",
          multiple ? "Does not contain" : "Is not",
          true,
        ),
        {
          id: "is-empty",
          name: "Is empty",
          operand: { kind: "none" as const },
          matches: (data: Data) => isEmpty(data),
        },
        {
          id: "is-not-empty",
          name: "Is not empty",
          operand: { kind: "none" as const },
          matches: (data: Data) => !isEmpty(data),
        },
      ],
    },
  };
}

/**
 * Transfers the property configuration to "select" or "multi-select"
 */
function toSelectConfig(column: ColumnInfo, data: Row[]): SelectConfig {
  switch (column.type) {
    case "select":
    case "multi-select":
      return (column as ColumnInfo<SelectPlugin>).config;
    case "text": {
      const options = data.reduce<SelectConfig["options"]>(
        (acc, row) => {
          const cell = row.properties[column.id]! as Cell<
            CellPlugin<string, string>
          >;
          cell.value.split(",").forEach((v) => {
            const name = v.trim();
            if (!name || acc.items[name]) return;
            acc.names.push(name);
            acc.items[name] = { id: v4(), name, color: getRandomColor() };
          });
          return acc;
        },
        { names: [], items: {} },
      );
      return { sort: "manual", options };
    }
    default:
      return getDefaultConfig();
  }
}

function fromValue(
  value: ComparableValue,
  config: SelectConfig,
  type: "select" | "multi-select",
): string[] {
  if (typeof value !== "string") return [];
  const values = value.split(",").reduce((acc, v) => {
    if (type === "select" && acc.size > 0) return acc;
    const name = v.trim();
    if (!name) return acc;
    const option = config.options.items[name];
    if (!option) return acc;
    acc.add(option.name);
    return acc;
  }, new Set<string>());
  return Array.from(values);
}

export function select(): SelectPlugin {
  const isEmpty = (data: string | null) => data === null;
  return {
    id: "select",
    default: {
      data: null,
      config: getDefaultConfig(),
    },
    fromValue: (value, config) => {
      const options = fromValue(value, config, "select");
      return options.at(0) ?? null;
    },
    toValue: (data) => data,
    isEmpty,
    toTextValue: (data) => data ?? "",
    transferConfig: toSelectConfig,
    compare: createCompareFn<SelectPlugin>((a, b) => {
      if (a === null && b === null) return 0;
      // undefined sorts after defined values
      if (a === null) return 1;
      if (b === null) return -1;
      return compareStrings(a, b);
    }),
    sorting: {
      defaultMethod: "select",
      enableGroupSort: true,
      methods: [
        {
          id: "select",
          name: "Select",
          ascendingLabel: "Ascending",
          descendingLabel: "Descending",
          toComparable: (data) => getFirstOption(data) ?? "",
          compare: (a, b) => compareEmptyLastStrings(String(a), String(b)),
        },
      ],
    },
    grouping: {
      defaultMethod: "value",
      methods: [
        {
          id: "value",
          name: "Value",
          function: (data) => groupByValue(getFirstOption(data)),
        },
      ],
    },
    counting: genericCounting(isEmpty),
    ...selectFiltering(isEmpty),
  };
}

export function multiSelect(): MultiSelectPlugin {
  const isEmpty = (data: string[]) => data.length === 0;
  return {
    id: "multi-select",
    default: {
      data: [],
      config: getDefaultConfig(),
    },
    fromValue: (value, config) => fromValue(value, config, "multi-select"),
    toValue: (data) => data.join(","),
    toGroupValue: (data) => data[0] ?? null,
    isEmpty,
    toTextValue: (data) => data.join(","),
    compare: createCompareFn<MultiSelectPlugin>((a, b) => {
      if (a.length === 0 && b.length === 0) return 0;
      // empty sorts after defined values
      if (a.length === 0) return 1;
      if (b.length === 0) return -1;
      return compareStrings(a[0]!, b[0]!);
    }),
    sorting: {
      defaultMethod: "select",
      enableGroupSort: true,
      methods: [
        {
          id: "select",
          name: "Select",
          ascendingLabel: "Ascending",
          descendingLabel: "Descending",
          toComparable: (data) => getFirstOption(data) ?? "",
          compare: (a, b) => compareEmptyLastStrings(String(a), String(b)),
        },
      ],
    },
    grouping: {
      defaultMethod: "value",
      methods: [
        {
          id: "value",
          name: "Value",
          function: (data) => groupByValue(getFirstOption(data)),
        },
      ],
    },
    transferConfig: toSelectConfig,
    counting: genericCounting(isEmpty),
    ...selectFiltering(isEmpty, true),
  };
}
