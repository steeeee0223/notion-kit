import type { Row } from "@notion-kit/table-hook";

import type {
  CellPlugin,
  CompareFn,
  InferData,
} from "./types";

/**
 * Comparison function for strings (case-sensitive)
 * Returns negative if a < b, positive if a > b, zero if equal
 */
export function compareStrings(a: string, b: string) {
  return a.localeCompare(b);
}

/**
 * Comparison function for numbers
 * Returns negative if a < b, positive if a > b, zero if equal
 */
export function compareNumbers(a: number, b: number) {
  return a - b;
}

/**
 * Comparison function for booleans
 * false sorts before true
 */
export function compareBooleans(a: boolean, b: boolean) {
  return Number(a) - Number(b);
}

export function createCompareFn<TPlugin extends CellPlugin>(
  compareFn: CompareFn<InferData<TPlugin>>,
): (rowA: Row, rowB: Row, colId: string) => number {
  return (rowA, rowB, colId) => {
    const dataA = rowA.properties[colId]?.value as InferData<TPlugin>;
    const dataB = rowB.properties[colId]?.value as InferData<TPlugin>;
    return compareFn(dataA, dataB);
  };
}
