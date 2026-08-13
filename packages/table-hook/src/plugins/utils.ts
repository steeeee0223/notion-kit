import {
  aggregateCountAll,
  aggregateCountEmpty,
  aggregateCountNonEmpty,
  aggregateCountUnique,
  aggregateCountValues,
  compareBooleans,
  compareNumbers,
  compareStrings,
  groupByTextAlphabetical,
  groupByTextExact,
} from "@/fns";
import type { Row } from "@/lib/types";
import { CountMethod, type CountingMethod } from "@/methods";
import type {
  CellPlugin,
  ComparableValue,
  CompareFn,
  InferData,
} from "@/plugins";

export function getDefaultGroupingValue(value: ComparableValue) {
  if (typeof value === "string") return value || "(Empty)";
  if (typeof value === "boolean") return value ? "True" : "False";
  if (value === null) return "(Empty)";
  return value;
}

function capCount(result: unknown, isCapped?: boolean) {
  const count = Number(result);
  return isCapped && count > 99 ? "99+" : String(count);
}

function percentage(result: unknown, total: number) {
  return total === 0
    ? "0.0%"
    : `${((Number(result) * 100) / total).toFixed(1)}%`;
}

const countAll: CountingMethod = {
  id: CountMethod.ALL,
  name: "All",
  label: "count",
  aggregationFn: aggregateCountAll,
  formatResult: (result, { isCapped }) => capCount(result, isCapped),
};
const countValues: CountingMethod = {
  id: CountMethod.VALUES,
  name: "Values",
  label: "values",
  aggregationFn: aggregateCountValues,
  formatResult: (result, { isCapped }) => capCount(result, isCapped),
};
const countUnique: CountingMethod = {
  id: CountMethod.UNIQUE,
  name: "Unique",
  label: "unique",
  aggregationFn: aggregateCountUnique,
  formatResult: (result, { isCapped }) => capCount(result, isCapped),
};
const countEmpty: CountingMethod = {
  id: CountMethod.EMPTY,
  name: "Empty",
  label: "empty",
  aggregationFn: aggregateCountEmpty,
  formatResult: (result, { isCapped }) => capCount(result, isCapped),
};
const countNonEmpty: CountingMethod = {
  id: CountMethod.NONEMPTY,
  name: "Not empty",
  label: "not empty",
  aggregationFn: aggregateCountNonEmpty,
  formatResult: (result, { isCapped }) => capCount(result, isCapped),
};
const countChecked: CountingMethod = {
  ...countNonEmpty,
  id: CountMethod.CHECKED,
  name: "Checked",
  label: "checked",
};
const countUnchecked: CountingMethod = {
  ...countEmpty,
  id: CountMethod.UNCHECKED,
  name: "Unchecked",
  label: "unchecked",
};
const percentageChecked: CountingMethod = {
  id: CountMethod.PERCENTAGE_CHECKED,
  name: "Checked",
  label: "checked",
  aggregationFn: aggregateCountNonEmpty,
  formatResult: (result, { rows }) => percentage(result, rows.length),
};
const percentageUnchecked: CountingMethod = {
  id: CountMethod.PERCENTAGE_UNCHECKED,
  name: "Unchecked",
  label: "unchecked",
  aggregationFn: aggregateCountEmpty,
  formatResult: (result, { rows }) => percentage(result, rows.length),
};
const percentageEmpty: CountingMethod = {
  ...percentageUnchecked,
  id: CountMethod.PERCENTAGE_EMPTY,
  name: "Empty",
  label: "empty",
};
const percentageNonEmpty: CountingMethod = {
  ...percentageChecked,
  id: CountMethod.PERCENTAGE_NONEMPTY,
  name: "Not empty",
  label: "not empty",
};

export const genericCounting = [
  {
    group: "Count",
    functions: [countAll, countValues, countUnique, countEmpty, countNonEmpty],
  },
  {
    group: "Percentage",
    functions: [percentageEmpty, percentageNonEmpty],
  },
];

export const checkboxCounting = [
  {
    group: "Count",
    functions: [countAll, countChecked, countUnchecked],
  },
  {
    group: "Percentage",
    functions: [percentageChecked, percentageUnchecked],
  },
];

export function textMethodCapabilities<Data = string>() {
  return {
    sorting: {
      defaultMethod: "text",
      enableGroupSort: true,
      methods: [
        {
          id: "text",
          name: "Text",
          ascendingLabel: "A → Z",
          descendingLabel: "Z → A",
          toComparable: (data: Data) => String(data ?? ""),
          compare: (a: ComparableValue, b: ComparableValue) =>
            compareStrings(String(a), String(b)),
          sortFn: "text" as const,
        },
      ],
    },
    grouping: {
      defaultMethod: "exact",
      methods: [
        {
          id: "exact",
          name: "Exact",
          function: (data: Data) => groupByTextExact(data),
        },
        {
          id: "alphabetical",
          name: "Alphabetical",
          function: (data: Data) => groupByTextAlphabetical(data),
        },
      ],
    },
  };
}

export { compareBooleans, compareNumbers, compareStrings };

export function createCompareFn<TPlugin extends CellPlugin>(
  compareFn: CompareFn<InferData<TPlugin>>,
): (rowA: Row, rowB: Row, colId: string) => number {
  return (rowA, rowB, colId) => {
    const dataA = rowA.properties[colId]?.value as
      | InferData<TPlugin>
      | undefined;
    const dataB = rowB.properties[colId]?.value as
      | InferData<TPlugin>
      | undefined;
    if (typeof dataA === "undefined")
      return typeof dataB === "undefined" ? 0 : -1;
    if (typeof dataB === "undefined") return 1;
    return compareFn(dataA, dataB);
  };
}
