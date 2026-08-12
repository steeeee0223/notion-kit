import { isValid, max, min, toDate } from "date-fns";

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

function numberValues<TRow>(context: {
  rows: readonly TRow[];
  getValue: (row: TRow) => unknown;
}) {
  return context.rows.flatMap((row) => {
    const value = context.getValue(row);
    if (typeof value === "string" && value.trim() === "") return [];
    if (typeof value !== "string" && typeof value !== "number") return [];
    const number = Number(value);
    return Number.isFinite(number) ? [number] : [];
  });
}

function numericAggregation(
  calculate: (values: number[]) => number,
): CommonAggregationFn {
  return {
    aggregate: (context) => {
      const values = numberValues(context);
      return values.length === 0 ? "" : calculate(values);
    },
  };
}

export const aggregateNumberSum = numericAggregation((values) =>
  values.reduce((sum, value) => sum + value, 0),
);

export const aggregateNumberAverage = numericAggregation(
  (values) => values.reduce((sum, value) => sum + value, 0) / values.length,
);

export const aggregateNumberMedian = numericAggregation((values) => {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[middle - 1]! + sorted[middle]!) / 2
    : sorted[middle]!;
});

export const aggregateNumberMinimum = numericAggregation((values) =>
  Math.min(...values),
);

export const aggregateNumberMaximum = numericAggregation((values) =>
  Math.max(...values),
);

export const aggregateNumberRange = numericAggregation(
  (values) => Math.max(...values) - Math.min(...values),
);

export interface DateRangeValue {
  start?: number;
  end?: number;
  includeTime?: boolean;
}

function toDateRangeValue(value: unknown): DateRangeValue | null {
  if (typeof value === "number") {
    return isValid(toDate(value)) ? { start: value } : null;
  }
  if (!value || typeof value !== "object") return null;
  const { start, end, includeTime } = value as {
    start?: unknown;
    end?: unknown;
    includeTime?: unknown;
  };
  const validStart =
    typeof start === "number" && isValid(toDate(start)) ? start : undefined;
  const validEnd =
    typeof end === "number" && isValid(toDate(end)) ? end : undefined;
  return validStart === undefined
    ? null
    : {
        start: validStart,
        end: validEnd,
        ...(includeTime === true ? { includeTime: true } : {}),
      };
}

function dateValues<TRow>(context: {
  rows: readonly TRow[];
  getValue: (row: TRow) => unknown;
}) {
  return context.rows.flatMap((row) => {
    const value = toDateRangeValue(context.getValue(row));
    return value === null ? [] : [value];
  });
}

function getDateBoundaries(values: DateRangeValue[]) {
  const start = min(values.map((value) => toDate(value.start!))).getTime();
  const end = max(
    values.map((value) => toDate(value.end ?? value.start!)),
  ).getTime();
  return {
    start,
    end,
    startIncludesTime: values.some(
      (value) => value.start === start && value.includeTime === true,
    ),
    endIncludesTime: values.some(
      (value) =>
        (value.end ?? value.start) === end && value.includeTime === true,
    ),
  };
}

export const aggregateDateEarliest: CommonAggregationFn = {
  aggregate: (context) => {
    const values = dateValues(context);
    if (values.length === 0) return "";
    const boundaries = getDateBoundaries(values);
    return {
      value: boundaries.start,
      includeTime: boundaries.startIncludesTime,
    };
  },
};

export const aggregateDateLatest: CommonAggregationFn = {
  aggregate: (context) => {
    const values = dateValues(context);
    if (values.length === 0) return "";
    const boundaries = getDateBoundaries(values);
    return {
      value: boundaries.end,
      includeTime: boundaries.endIncludesTime,
    };
  },
};

export const aggregateDateRange: CommonAggregationFn = {
  aggregate: (context) => {
    const values = dateValues(context);
    if (values.length === 0) return "";
    const boundaries = getDateBoundaries(values);
    return {
      start: boundaries.start,
      end: boundaries.end,
      includeTime: boundaries.startIncludesTime || boundaries.endIncludesTime,
    };
  },
};
