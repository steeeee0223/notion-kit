import { z } from "zod";

import {
  aggregateDateEarliest,
  aggregateDateLatest,
  aggregateDateRange,
  aggregateNumberAverage,
  aggregateNumberMaximum,
  aggregateNumberMedian,
  aggregateNumberMinimum,
  aggregateNumberRange,
  aggregateNumberSum,
} from "@/fns";
import type { ColumnInfo, Row } from "@/lib/types";
import type { CountingMethodGroup } from "@/methods";

import {
  date,
  formatDateRangeDuration,
  toDateString,
  type DateConfig,
  type DateData,
} from "../date";
import { formatNumber, number, type NumberConfig } from "../number";
import type { PropertyReference } from "../references";
import type { CellPlugin, FilterOperatorDescriptor } from "../types";
import { genericCounting, getFilterOperators } from "../utils";

const listCalculations = {
  original: "Show original",
  unique: "Show unique values",
};
const countCalculations = {
  "count-all": "Count all",
  "count-values": "Count values",
  "count-unique": "Count unique values",
  "count-empty": "Count empty",
  "count-not-empty": "Count not empty",
  "percent-empty": "Percent empty",
  "percent-not-empty": "Percent not empty",
};
const numericCalculations = {
  sum: { label: "Sum", fn: aggregateNumberSum },
  average: { label: "Average", fn: aggregateNumberAverage },
  median: { label: "Median", fn: aggregateNumberMedian },
  min: { label: "Min", fn: aggregateNumberMinimum },
  max: { label: "Max", fn: aggregateNumberMaximum },
  range: { label: "Range", fn: aggregateNumberRange },
};
const dateCalculations = {
  earliest: { label: "Earliest date", fn: aggregateDateEarliest },
  latest: { label: "Latest date", fn: aggregateDateLatest },
  "date-range": { label: "Date range", fn: aggregateDateRange },
};

export type RollupCalculation =
  | keyof typeof listCalculations
  | keyof typeof countCalculations
  | keyof typeof numericCalculations
  | keyof typeof dateCalculations;
export interface RollupConfig {
  relationPropertyId: string;
  targetPropertyId: string;
  calculation: RollupCalculation;
  format: NumberConfig["format"];
  round: NumberConfig["round"];
}

export interface RollupListEntry {
  data: unknown;
  text: string;
  row: Row;
}

export const rollupListOperandSchema = z.object({
  operator: z.string(),
  value: z.json().optional(),
});

export type RollupValue =
  | { kind: "number"; value: number; text: string }
  | { kind: "date"; value: DateData; text: string; config: DateConfig }
  | {
      kind: "list";
      value: RollupListEntry[];
      text: string;
      property: ColumnInfo;
    }
  | null;

export type RollupPlugin = CellPlugin<"rollup", RollupValue, RollupConfig>;

export function isRollupDateType(type: string) {
  return (
    type === "date" || type === "created-time" || type === "last-edited-time"
  );
}

export function getRollupCalculations(type?: string) {
  return [
    ...Object.entries(listCalculations).map(([value, label]) => ({
      value,
      label,
    })),
    ...Object.entries(countCalculations).map(([value, label]) => ({
      value,
      label,
    })),
    ...(type === "number" || type === "id"
      ? Object.entries(numericCalculations).map(([value, { label }]) => ({
          value,
          label,
        }))
      : []),
    ...(type && isRollupDateType(type)
      ? Object.entries(dateCalculations).map(([value, { label }]) => ({
          value,
          label,
        }))
      : []),
  ];
}

export function getRollupResultKind(calculation: RollupCalculation) {
  if (Object.hasOwn(listCalculations, calculation)) return "list";
  if (Object.hasOwn(dateCalculations, calculation)) return "date";
  return "number";
}

const defaultNumberConfig = number().default.config;

function formatRollupNumber(
  value: number,
  { format, round }: Pick<RollupConfig, "format" | "round">,
) {
  return formatNumber(value, { ...defaultNumberConfig, format, round });
}

function calculateDateRollup(
  calculation: keyof typeof dateCalculations,
  property: ColumnInfo,
  plugin: CellPlugin,
  filled: { row: Row; data: unknown }[],
): RollupValue {
  const result = dateCalculations[calculation].fn.aggregate({
    rows: filled,
    getValue: ({ row, data }) =>
      property.type === "date"
        ? data
        : { start: plugin.toValue(data, row), includeTime: true },
  });
  if (result === "") return null;
  const value =
    "value" in result
      ? { start: result.value, includeTime: result.includeTime }
      : { ...result, endDate: true };
  const config = property.config as DateConfig;
  const text =
    calculation === "date-range"
      ? formatDateRangeDuration(value, config)
      : toDateString(value, config);
  return { kind: "date", value, text, config };
}

export function calculateRollup(
  config: RollupConfig,
  property: ColumnInfo,
  plugin: CellPlugin,
  rows: readonly Row[],
): RollupValue {
  const values = rows.map((row) => {
    const data: unknown =
      row.properties[property.id]?.value ?? plugin.default.data;
    return { row, data, empty: plugin.isEmpty(data) };
  });
  const filled = values.filter(({ empty }) => !empty);
  const getEntries = () =>
    filled.flatMap(({ data, row }) => {
      if (!Array.isArray(data))
        return [{ data, row, text: plugin.toTextValue(data, row) }];
      return data.map((item: unknown) => {
        const value = [item];
        return { data: value, row, text: plugin.toTextValue(value, row) };
      });
    });
  const unique = () =>
    Array.from(
      new Map(
        getEntries().map((entry) => {
          const reference =
            Array.isArray(entry.data) &&
            (entry.data[0] as PropertyReference | undefined);
          const key =
            reference && typeof reference.id === "string"
              ? reference.id
              : entry.text;
          return [key, entry];
        }),
      ).values(),
    );
  const { calculation } = config;
  if (calculation === "original" || calculation === "unique") {
    const value = calculation === "unique" ? unique() : getEntries();
    return {
      kind: "list",
      value,
      text: value.map(({ text }) => text).join(", "),
      property,
    };
  }
  if (
    isRollupDateType(property.type) &&
    Object.hasOwn(dateCalculations, calculation)
  ) {
    return calculateDateRollup(
      calculation as keyof typeof dateCalculations,
      property,
      plugin,
      filled,
    );
  }
  const emptyCount = values.length - filled.length;
  let value: number;
  switch (calculation) {
    case "count-all":
      value = values.length;
      break;
    case "count-values":
      value = filled.reduce(
        (count, { data }) => count + (Array.isArray(data) ? data.length : 1),
        0,
      );
      break;
    case "count-not-empty":
      value = filled.length;
      break;
    case "count-unique":
      value = unique().length;
      break;
    case "count-empty":
      value = emptyCount;
      break;
    case "percent-empty":
      value = values.length ? (emptyCount * 100) / values.length : 0;
      break;
    case "percent-not-empty":
      value = values.length ? (filled.length * 100) / values.length : 0;
      break;
    default: {
      if (
        !Object.hasOwn(numericCalculations, calculation) ||
        (property.type !== "number" && property.type !== "id")
      )
        return null;
      const method =
        numericCalculations[calculation as keyof typeof numericCalculations];
      const aggregate = method.fn.aggregate({
        rows: filled,
        getValue: ({ row, data }) => plugin.toValue(data, row),
      });
      if (aggregate === "") return null;
      value = aggregate;
    }
  }
  if (!Number.isFinite(value)) return null;
  return {
    kind: "number",
    value,
    text: formatRollupNumber(value, config),
  };
}

function rollupOperators(): FilterOperatorDescriptor<
  RollupValue,
  RollupConfig
>[] {
  const numeric = number();
  const dates = date();
  return [
    ...numeric.filtering!.operators.map(
      (operator): FilterOperatorDescriptor<RollupValue, RollupConfig> => ({
        ...operator,
        available: (config) =>
          getRollupResultKind(config.calculation) === "number",
        matches: (data, row, _config, operand, context) =>
          operator.matches(
            data?.kind === "number" ? String(data.value) : null,
            row,
            numeric.default.config,
            operand,
            context,
          ),
      }),
    ),
    ...dates.filtering!.operators.map(
      (operator): FilterOperatorDescriptor<RollupValue, RollupConfig> => ({
        ...operator,
        id: `date-${operator.id}`,
        available: (config) =>
          getRollupResultKind(config.calculation) === "date",
        matches: (data, row, _config, operand, context) =>
          operator.matches(
            data?.kind === "date" ? data.value : {},
            row,
            data?.kind === "date" ? data.config : dates.default.config,
            operand,
            context,
          ),
      }),
    ),
    ...(["any", "every", "none"] as const).map(
      (mode): FilterOperatorDescriptor<RollupValue, RollupConfig> => ({
        id: `list-${mode}`,
        name: mode === "any" ? "Any" : mode === "every" ? "Every" : "None",
        operand: { kind: "rollup-list" },
        available: (config) =>
          getRollupResultKind(config.calculation) === "list",
        matches: (data, _row, _config, operand, context) => {
          if (data?.kind !== "list") return false;
          const parsed = rollupListOperandSchema.safeParse(operand);
          if (!parsed.success) return false;
          const { property } = data;
          const operator = getFilterOperators(
            context.plugins?.[property.type],
            property.config,
          ).find(({ id }) => id === parsed.data.operator);
          if (!operator) return false;
          const matches = (entry: RollupListEntry) =>
            operator.matches(
              entry.data,
              entry.row,
              property.config,
              parsed.data.value,
              context,
            );
          if (mode === "every") return data.value.every(matches);
          return data.value.some(matches) === (mode === "any");
        },
      }),
    ),
    {
      id: "list-is-empty",
      name: "Is empty",
      operand: { kind: "none" },
      available: (config) => getRollupResultKind(config.calculation) === "list",
      matches: isRollupEmpty,
    },
    {
      id: "list-is-not-empty",
      name: "Is not empty",
      operand: { kind: "none" },
      available: (config) => getRollupResultKind(config.calculation) === "list",
      matches: (data) => data?.kind === "list" && data.value.length > 0,
    },
  ];
}

function isRollupEmpty(data: RollupValue) {
  return !data || (data.kind === "list" && data.value.length === 0);
}

function rollupCounting(): CountingMethodGroup[] {
  return [
    ...genericCounting(isRollupEmpty),
    {
      group: "Calculate",
      functions: Object.entries(numericCalculations).map(
        ([id, { label, fn }]) => ({
          id,
          name: label,
          aggregationFn: fn,
          available: (config) =>
            getRollupResultKind((config as RollupConfig).calculation) ===
            "number",
          toAggregationValue: (data) => {
            const value = data as RollupValue;
            return value?.kind === "number" ? value.value : null;
          },
          formatResult: (result, { table, colId }) => {
            if (typeof result !== "number") return "";
            return formatRollupNumber(
              result,
              table.getColumnInfo(colId).config as RollupConfig,
            );
          },
        }),
      ),
    },
  ];
}

export function rollup(): RollupPlugin {
  return {
    id: "rollup",
    default: {
      data: null,
      config: {
        relationPropertyId: "",
        targetPropertyId: "",
        calculation: "original",
        format: "number",
        round: "default",
      },
    },
    fromValue: () => null,
    toValue: (data) =>
      data?.kind === "number" ? data.value : (data?.text ?? null),
    toTextValue: (data) => data?.text ?? "",
    isEmpty: isRollupEmpty,
    canGroup: false,
    canSort: (config) => getRollupResultKind(config.calculation) === "number",
    readOnly: true,
    sorting: {
      defaultMethod: "number",
      methods: [
        {
          id: "number",
          name: "Number",
          ascendingLabel: "Low → high",
          descendingLabel: "High → low",
          toComparable: (data) => (data?.kind === "number" ? data.value : null),
          sortFn: "number",
        },
      ],
    },
    filtering: { operators: rollupOperators() },
    counting: rollupCounting(),
  };
}
