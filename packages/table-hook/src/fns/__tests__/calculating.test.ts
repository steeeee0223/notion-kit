import { describe, expect, it } from "vitest";

import {
  aggregateCountAll,
  aggregateCountEmpty,
  aggregateCountNonEmpty,
  aggregateCountUnique,
  aggregateCountValues,
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
    const values = ["Alpha, Beta", "", "Alpha", false, null];

    expect(aggregate(aggregateCountAll, values)).toBe(5);
    expect(aggregate(aggregateCountValues, values)).toBe(3);
    expect(aggregate(aggregateCountUnique, values)).toBe(2);
    expect(aggregate(aggregateCountEmpty, values)).toBe(3);
    expect(aggregate(aggregateCountNonEmpty, values)).toBe(2);
  });
});
