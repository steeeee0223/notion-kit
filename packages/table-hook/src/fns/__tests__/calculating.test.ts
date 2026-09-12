import { describe, expect, it } from "vitest";

import {
  aggregateCountAll,
  aggregateCountUnique,
  aggregateCountValues,
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

function aggregate(
  definition: { aggregate: (context: never) => unknown },
  values: unknown[],
) {
  const rows = values.map((value, index) => ({ id: String(index), value }));
  return definition.aggregate({
    rows,
    getValue: (row: (typeof rows)[number]) => row.value,
  } as never);
}

describe("common calculation functions", () => {
  it("returns semantic numeric count results before presentation formatting", () => {
    const values = ["Alpha, Beta", "", " Alpha ", false, null];

    expect(aggregate(aggregateCountAll, values)).toBe(5);
    expect(aggregate(aggregateCountValues, values)).toBe(3);
    expect(aggregate(aggregateCountUnique, values)).toBe(2);
  });

  it("calculates semantic number results while ignoring invalid values", () => {
    const values = [null, "-10", "0", "10.5", "20.5", "invalid", Infinity];

    expect(aggregate(aggregateNumberSum, values)).toBe(21);
    expect(aggregate(aggregateNumberAverage, values)).toBe(5.25);
    expect(aggregate(aggregateNumberMedian, values)).toBe(5.25);
    expect(aggregate(aggregateNumberMinimum, values)).toBe(-10);
    expect(aggregate(aggregateNumberMaximum, values)).toBe(20.5);
    expect(aggregate(aggregateNumberRange, values)).toBe(30.5);
    expect(aggregate(aggregateNumberSum, [null, "invalid"])).toBe("");
    expect(aggregate(aggregateNumberSum, ["   ", {}, Number.NaN])).toBe("");
  });

  it("does not mutate input while finding an even or odd median", () => {
    const values = [3, 1, 2, 4];
    expect(aggregate(aggregateNumberMedian, values)).toBe(2.5);
    expect(values).toEqual([3, 1, 2, 4]);
    expect(aggregate(aggregateNumberMedian, [3, 1, 2])).toBe(2);
  });

  it("calculates earliest start, latest end fallback, and date range", () => {
    const values = [
      {},
      { start: 300, includeTime: true },
      { start: 100, end: 250 },
      { start: 200, end: 500, includeTime: true },
      { start: Number.NaN },
    ];

    expect(aggregate(aggregateDateEarliest, values)).toEqual({
      value: 100,
      includeTime: false,
    });
    expect(aggregate(aggregateDateLatest, values)).toEqual({
      value: 500,
      includeTime: true,
    });
    expect(aggregate(aggregateDateRange, values)).toEqual({
      start: 100,
      end: 500,
      includeTime: true,
    });
    expect(
      aggregate(aggregateDateRange, [
        { start: 100 },
        { start: 200, end: 300 },
        { start: 150, end: 250, includeTime: true },
      ]),
    ).toEqual({ start: 100, end: 300, includeTime: false });
    expect(aggregate(aggregateDateRange, [{}, null])).toBe("");
    expect(aggregate(aggregateDateEarliest, [])).toBe("");
    expect(aggregate(aggregateDateLatest, [])).toBe("");
    expect(aggregate(aggregateDateEarliest, [100])).toEqual({
      value: 100,
      includeTime: false,
    });
    expect(aggregate(aggregateDateLatest, [Number.POSITIVE_INFINITY])).toBe("");
  });

  it("merges time metadata across tied winning date boundaries regardless of row order", () => {
    const values = [
      { start: 100, end: 500 },
      { start: 100, end: 300, includeTime: true },
      { start: 200, end: 500, includeTime: true },
    ];

    for (const ordered of [values, [...values].reverse()]) {
      expect(aggregate(aggregateDateEarliest, ordered)).toEqual({
        value: 100,
        includeTime: true,
      });
      expect(aggregate(aggregateDateLatest, ordered)).toEqual({
        value: 500,
        includeTime: true,
      });
      expect(aggregate(aggregateDateRange, ordered)).toEqual({
        start: 100,
        end: 500,
        includeTime: true,
      });
    }
  });
});
