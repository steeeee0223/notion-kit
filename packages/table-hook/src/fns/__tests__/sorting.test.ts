import { describe, expect, it } from "vitest";

import {
  compareBooleans,
  compareEmptyLastStrings,
  compareFirstOptions,
  compareNumbers,
  compareStrings,
  sortBooleans,
  sortNumbers,
  sortStrings,
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

  it("compares select values by their first option with empty values last", () => {
    expect(compareFirstOptions(["Alpha", "Zulu"], ["Beta"])).toBeLessThan(0);
    expect(compareFirstOptions("Alpha", null)).toBeLessThan(0);
    expect(compareFirstOptions([], ["Alpha"])).toBeGreaterThan(0);
    expect(compareFirstOptions([], null)).toBe(0);
  });

  it("orders empty strings last and executes all TanStack adapters", () => {
    expect(compareEmptyLastStrings("", "")).toBe(0);
    expect(compareEmptyLastStrings("", "Alpha")).toBeGreaterThan(0);
    expect(compareEmptyLastStrings("Alpha", "")).toBeLessThan(0);
    expect(compareEmptyLastStrings("Alpha", "Beta")).toBeLessThan(0);
    expect(sortStrings(row("Alpha"), row("Beta"), "value")).toBeLessThan(0);
    expect(sortBooleans(row(false), row(true), "value")).toBeLessThan(0);
  });
});
