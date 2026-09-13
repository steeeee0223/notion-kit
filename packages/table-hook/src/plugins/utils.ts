import {
  aggregateCountAll,
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
  FilterValue,
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
function createEmptyCountingMethods<Data>(isEmpty: (data: Data) => boolean) {
  const toAggregationValue = (data: unknown) => data;
  const aggregateEmpty: CountingMethod["aggregationFn"] = {
    aggregate: ({ rows, getValue }) =>
      rows.reduce(
        (count, row) => count + Number(isEmpty(getValue(row) as Data)),
        0,
      ),
  };
  const aggregateNonEmpty: CountingMethod["aggregationFn"] = {
    aggregate: ({ rows, getValue }) =>
      rows.reduce(
        (count, row) => count + Number(!isEmpty(getValue(row) as Data)),
        0,
      ),
  };
  const countEmpty = {
    id: CountMethod.EMPTY,
    name: "Empty",
    label: "empty",
    aggregationFn: aggregateEmpty,
    toAggregationValue,
    formatResult: (result, { isCapped }) => capCount(result, isCapped),
  } satisfies CountingMethod;
  const countNonEmpty = {
    id: CountMethod.NONEMPTY,
    name: "Not empty",
    label: "not empty",
    aggregationFn: aggregateNonEmpty,
    toAggregationValue,
    formatResult: (result, { isCapped }) => capCount(result, isCapped),
  } satisfies CountingMethod;
  const percentageEmpty = {
    ...countEmpty,
    id: CountMethod.PERCENTAGE_EMPTY,
    formatResult: (result, { rows }) => percentage(result, rows.length),
  } satisfies CountingMethod;
  const percentageNonEmpty = {
    ...countNonEmpty,
    id: CountMethod.PERCENTAGE_NONEMPTY,
    formatResult: (result, { rows }) => percentage(result, rows.length),
  } satisfies CountingMethod;

  return { countEmpty, countNonEmpty, percentageEmpty, percentageNonEmpty };
}

export function genericCounting<Data>(isEmpty: (data: Data) => boolean) {
  const methods = createEmptyCountingMethods(isEmpty);

  return [
    {
      group: "Count",
      functions: [
        countAll,
        countValues,
        countUnique,
        methods.countEmpty,
        methods.countNonEmpty,
      ],
    },
    {
      group: "Percentage",
      functions: [methods.percentageEmpty, methods.percentageNonEmpty],
    },
  ];
}

export function checkboxCounting<Data>(isEmpty: (data: Data) => boolean) {
  const methods = createEmptyCountingMethods(isEmpty);
  const countChecked = {
    ...methods.countNonEmpty,
    id: CountMethod.CHECKED,
    name: "Checked",
    label: "checked",
  } satisfies CountingMethod;
  const countUnchecked = {
    ...methods.countEmpty,
    id: CountMethod.UNCHECKED,
    name: "Unchecked",
    label: "unchecked",
  } satisfies CountingMethod;
  const percentageChecked = {
    ...methods.percentageNonEmpty,
    id: CountMethod.PERCENTAGE_CHECKED,
    name: "Checked",
    label: "checked",
  } satisfies CountingMethod;
  const percentageUnchecked = {
    ...methods.percentageEmpty,
    id: CountMethod.PERCENTAGE_UNCHECKED,
    name: "Unchecked",
    label: "unchecked",
  } satisfies CountingMethod;

  return [
    {
      group: "Count",
      functions: [countAll, countChecked, countUnchecked],
    },
    {
      group: "Percentage",
      functions: [percentageChecked, percentageUnchecked],
    },
  ];
}

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

export function textFilteringCapabilities<Config = undefined>(
  isEmpty: (data: string) => boolean,
) {
  const normalizeOperand = (operand: unknown) =>
    typeof operand === "string" ? operand.toLowerCase() : null;
  const normalizeData = (data: string | undefined) =>
    typeof data === "string" ? data.toLowerCase() : "";
  const textOperator = (
    id: string,
    name: string,
    predicate: (data: string, operand: string) => boolean,
  ) => ({
    id,
    name,
    operand: { kind: "text" as const },
    matches: (
      data: string | undefined,
      _row: Row,
      _config: Config,
      operand?: FilterValue,
    ) => {
      const normalizedOperand = normalizeOperand(operand);
      return (
        normalizedOperand !== null &&
        predicate(normalizeData(data), normalizedOperand)
      );
    },
  });
  return {
    filtering: {
      operators: [
        textOperator("equals", "Equals", (data, operand) => data === operand),
        textOperator(
          "does-not-equal",
          "Does not equal",
          (data, operand) => data !== operand,
        ),
        textOperator("contains", "Contains", (data, operand) =>
          data.includes(operand),
        ),
        textOperator(
          "does-not-contain",
          "Does not contain",
          (data, operand) => !data.includes(operand),
        ),
        textOperator("starts-with", "Starts with", (data, operand) =>
          data.startsWith(operand),
        ),
        textOperator("ends-with", "Ends with", (data, operand) =>
          data.endsWith(operand),
        ),
        {
          id: "is-empty",
          name: "Is empty",
          operand: { kind: "none" as const },
          matches: (data: string) => isEmpty(data),
        },
        {
          id: "is-not-empty",
          name: "Is not empty",
          operand: { kind: "none" as const },
          matches: (data: string) => !isEmpty(data),
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
