import * as z from "zod/v4/mini";

import {
  aggregateNumberAverage,
  aggregateNumberMaximum,
  aggregateNumberMedian,
  aggregateNumberMinimum,
  aggregateNumberRange,
  aggregateNumberSum,
  compareNumbers,
  groupByNumberInterval,
} from "@/fns";
import type { CountingMethod, CountingMethodGroup } from "@/methods";
import type { PluginFactoryConfig } from "@/plugins";

import { createCompareFn, genericCounting } from "../utils";
import { formatNumber } from "./format";
import type { NumberPlugin } from "./types";

export type NumberPluginConfig = PluginFactoryConfig<NumberPlugin>;

const numberSchema = z.pipe(
  z.custom((value) => !isNaN(Number(value))),
  z.transform((value) => String(value)),
);

function numberCalculation(
  id: string,
  name: string,
  aggregationFn: NonNullable<CountingMethod["aggregationFn"]>,
): CountingMethod {
  return {
    id,
    name,
    aggregationFn,
    toAggregationValue: (data) => data,
    formatResult: (result, { table, colId }) =>
      result === ""
        ? ""
        : formatNumber(
            Number(result),
            table.getColumnInfo(colId)
              .config as NumberPlugin["default"]["config"],
          ),
  };
}

const numberCalculations = [
  numberCalculation("sum", "Sum", aggregateNumberSum),
  numberCalculation("average", "Average", aggregateNumberAverage),
  numberCalculation("median", "Median", aggregateNumberMedian),
  numberCalculation("minimum", "Minimum", aggregateNumberMinimum),
  numberCalculation("maximum", "Maximum", aggregateNumberMaximum),
  numberCalculation("range", "Range", aggregateNumberRange),
];

export function withNumberCalculations(groups: CountingMethodGroup[] = []) {
  return [...groups, { group: "Calculate", functions: numberCalculations }];
}

export function number(config: NumberPluginConfig): NumberPlugin {
  return {
    id: "number",
    meta: {
      name: "Number",
      icon: config.icon,
      desc: "Accepts numbers. These can also be formatted as currency or progress bars. Useful for tracking counts, prices and completion.",
    },
    default: {
      name: "Number",
      icon: config.defaultIcon ?? config.icon,
      data: null,
      config: {
        format: "number",
        round: "default",
        showAs: "number",
        options: { color: "green", divideBy: 100, showNumber: true },
      },
    },
    fromValue: (value) => {
      const res = numberSchema.safeParse(value);
      return res.success ? res.data : null;
    },
    toValue: (data) => (data ? Number(data) : null),
    toTextValue: (data) => data ?? "",
    compare: createCompareFn<NumberPlugin>((a, b) => {
      if (a === null && b === null) return 0;
      // undefined sorts after defined values
      if (a === null) return 1;
      if (b === null) return -1;
      return compareNumbers(Number(a), Number(b));
    }),
    sorting: {
      defaultMethod: "number",
      enableGroupSort: true,
      methods: [
        {
          id: "number",
          name: "Number",
          ascendingLabel: "Low → high",
          descendingLabel: "High → low",
          toComparable: (data) => {
            if (typeof data !== "string" || data.trim() === "") {
              return null;
            }
            const value = Number(data);
            return Number.isFinite(value) ? value : null;
          },
          compare: (a, b) => compareNumbers(Number(a), Number(b)),
          sortFn: "number",
        },
      ],
    },
    grouping: {
      defaultMethod: "interval-1",
      methods: [1, 10, 100, 1000].map((interval) => ({
        id: `interval-${interval}`,
        name: `Every ${interval}`,
        function: (data: string | null) =>
          groupByNumberInterval(data, interval),
      })),
    },
    counting: withNumberCalculations(genericCounting),
    renderCell: config.renderCell,
    renderConfigMenu: config.renderConfigMenu,
    renderGroupingValue: config.renderGroupingValue,
  };
}
