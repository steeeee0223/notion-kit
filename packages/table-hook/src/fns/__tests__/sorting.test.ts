import { describe, expect, it } from "vitest";

import {
  compareBooleans,
  compareNumbers,
  compareStrings,
  sortNumbers,
} from "@/fns";

function row(value: unknown) {
  return { getValue: () => value } as never;
}

describe("common sorting functions", () => {
  it("compares primitive values in ascending order", () => {
    expect(compareStrings("Alpha", "Beta")).toBeLessThan(0);
    expect(compareNumbers(-1, 2)).toBeLessThan(0);
    expect(compareBooleans(false, true)).toBeLessThan(0);
  });

  it("orders nullish values deterministically before concrete values", () => {
    expect(sortNumbers(row(null), row(2), "value")).toBeLessThan(0);
    expect(sortNumbers(row(undefined), row(undefined), "value")).toBe(0);
    expect(sortNumbers(row(10), row(null), "value")).toBeGreaterThan(0);
  });
});
