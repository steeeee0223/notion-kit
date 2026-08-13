import type { SortFn } from "@tanstack/table-core";

export function compareStrings(a: string, b: string) {
  return a.localeCompare(b);
}

export function compareNumbers(a: number, b: number) {
  return a - b;
}

export function compareBooleans(a: boolean, b: boolean) {
  return Number(a) - Number(b);
}

export function getFirstOption(value: unknown): string | null {
  if (typeof value === "string" && value !== "") return value;
  if (Array.isArray(value)) {
    const first: unknown = value[0];
    return typeof first === "string" && first !== "" ? first : null;
  }
  return null;
}

export function compareFirstOptions(a: unknown, b: unknown) {
  const firstA = getFirstOption(a);
  const firstB = getFirstOption(b);
  if (firstA === null) return firstB === null ? 0 : 1;
  if (firstB === null) return -1;
  return compareStrings(firstA, firstB);
}

export function compareEmptyLastStrings(a: string, b: string) {
  if (a === "") return b === "" ? 0 : 1;
  if (b === "") return -1;
  return compareStrings(a, b);
}

function compareNullable<T>(
  a: T | null | undefined,
  b: T | null | undefined,
  compare: (valueA: T, valueB: T) => number,
) {
  if (a == null) return b == null ? 0 : -1;
  if (b == null) return 1;
  return compare(a, b);
}

export const sortStrings: SortFn<
  Record<never, never>,
  Record<string, unknown>
> = (rowA, rowB, columnId) =>
  compareNullable(
    rowA.getValue<string>(columnId),
    rowB.getValue<string>(columnId),
    compareStrings,
  );

export const sortNumbers: SortFn<
  Record<never, never>,
  Record<string, unknown>
> = (rowA, rowB, columnId) =>
  compareNullable(
    rowA.getValue<number>(columnId),
    rowB.getValue<number>(columnId),
    compareNumbers,
  );

export const sortBooleans: SortFn<
  Record<never, never>,
  Record<string, unknown>
> = (rowA, rowB, columnId) =>
  compareNullable(
    rowA.getValue<boolean>(columnId),
    rowB.getValue<boolean>(columnId),
    compareBooleans,
  );
