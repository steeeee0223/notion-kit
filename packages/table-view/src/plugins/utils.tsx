import {
  CountMethod,
  type CountingMethod,
  type Row,
} from "@notion-kit/table-hook";
import {
  aggregateCountAll,
  aggregateCountEmpty,
  aggregateCountNonEmpty,
  aggregateCountUnique,
  aggregateCountValues,
  compareBooleans,
  compareNumbers,
  compareStrings,
} from "@notion-kit/table-hook/fns";

import type { CellPlugin, CompareFn, InferData } from "./types";

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
  aggregationFn: aggregateCountAll,
  formatResult: (result, { isCapped }) => capCount(result, isCapped),
};
const countValues: CountingMethod = {
  id: CountMethod.VALUES,
  name: "Values",
  aggregationFn: aggregateCountValues,
  formatResult: (result, { isCapped }) => capCount(result, isCapped),
};
const countUnique: CountingMethod = {
  id: CountMethod.UNIQUE,
  name: "Unique",
  aggregationFn: aggregateCountUnique,
  formatResult: (result, { isCapped }) => capCount(result, isCapped),
};
const countEmpty: CountingMethod = {
  id: CountMethod.EMPTY,
  name: "Empty",
  aggregationFn: aggregateCountEmpty,
  formatResult: (result, { isCapped }) => capCount(result, isCapped),
};
const countNonEmpty: CountingMethod = {
  id: CountMethod.NONEMPTY,
  name: "Not empty",
  aggregationFn: aggregateCountNonEmpty,
  formatResult: (result, { isCapped }) => capCount(result, isCapped),
};
const countChecked: CountingMethod = {
  ...countNonEmpty,
  id: CountMethod.CHECKED,
  name: "Checked",
};
const countUnchecked: CountingMethod = {
  ...countEmpty,
  id: CountMethod.UNCHECKED,
  name: "Unchecked",
};
const percentageChecked: CountingMethod = {
  id: CountMethod.PERCENTAGE_CHECKED,
  name: "Checked",
  aggregationFn: aggregateCountNonEmpty,
  formatResult: (result, { rows }) => percentage(result, rows.length),
};
const percentageUnchecked: CountingMethod = {
  id: CountMethod.PERCENTAGE_UNCHECKED,
  name: "Unchecked",
  aggregationFn: aggregateCountEmpty,
  formatResult: (result, { rows }) => percentage(result, rows.length),
};
const percentageEmpty: CountingMethod = {
  ...percentageUnchecked,
  id: CountMethod.PERCENTAGE_EMPTY,
  name: "Empty",
};
const percentageNonEmpty: CountingMethod = {
  ...percentageChecked,
  id: CountMethod.PERCENTAGE_NONEMPTY,
  name: "Not empty",
};

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

export function withGenericCounting<TPlugin extends CellPlugin>(
  plugin: TPlugin,
): TPlugin {
  return { ...plugin, counting: plugin.counting ?? genericCounting };
}

export function withCheckboxCounting<TPlugin extends CellPlugin>(
  plugin: TPlugin,
): TPlugin {
  return { ...plugin, counting: plugin.counting ?? checkboxCounting };
}

/**
 * Comparison function for strings (case-sensitive)
 * Returns negative if a < b, positive if a > b, zero if equal
 */
export { compareStrings };

/**
 * Comparison function for numbers
 * Returns negative if a < b, positive if a > b, zero if equal
 */
export { compareNumbers };

/**
 * Comparison function for booleans
 * false sorts before true
 */
export { compareBooleans };

export function createCompareFn<TPlugin extends CellPlugin>(
  compareFn: CompareFn<InferData<TPlugin>>,
): (rowA: Row, rowB: Row, colId: string) => number {
  return (rowA, rowB, colId) => {
    const dataA = rowA.properties[colId]?.value as InferData<TPlugin>;
    const dataB = rowB.properties[colId]?.value as InferData<TPlugin>;
    return compareFn(dataA, dataB);
  };
}
