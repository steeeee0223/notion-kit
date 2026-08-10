import type { CommonAggregationFn } from "./types";

function toTextValue(value: unknown) {
  if (value == null || value === false) return "";
  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return String(value);
  }
  return "";
}

export const aggregateCountAll: CommonAggregationFn = {
  aggregate: ({ rows }) => rows.length,
};

export const aggregateCountValues: CommonAggregationFn = {
  aggregate: ({ rows, getValue }) =>
    rows.reduce(
      (count, row) =>
        count +
        toTextValue(getValue(row))
          .split(",")
          .filter((value) => value.trim()).length,
      0,
    ),
};

export const aggregateCountUnique: CommonAggregationFn = {
  aggregate: ({ rows, getValue }) => {
    const values = new Set<string>();
    rows.forEach((row) => {
      toTextValue(getValue(row))
        .split(",")
        .forEach((value) => {
          if (value.trim()) values.add(value);
        });
    });
    return values.size;
  },
};

export const aggregateCountEmpty: CommonAggregationFn = {
  aggregate: ({ rows, getValue }) =>
    rows.reduce(
      (count, row) => count + Number(toTextValue(getValue(row)) === ""),
      0,
    ),
};

export const aggregateCountNonEmpty: CommonAggregationFn = {
  aggregate: ({ rows, getValue }) =>
    rows.reduce(
      (count, row) => count + Number(toTextValue(getValue(row)) !== ""),
      0,
    ),
};
