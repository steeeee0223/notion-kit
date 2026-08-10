import { describe, expect, it } from "vitest";

import { groupByTextValue, groupByValue } from "@/fns";

describe("common grouping functions", () => {
  it("preserves neutral primitive grouping values", () => {
    expect(groupByValue("Alpha")).toBe("Alpha");
    expect(groupByValue(0)).toBe(0);
    expect(groupByValue(false)).toBe(false);
    expect(groupByValue(null)).toBeNull();
  });

  it("normalizes text-compatible values and empties without UI dependencies", () => {
    expect(groupByTextValue("Alpha")).toBe("Alpha");
    expect(groupByTextValue(0)).toBe("0");
    expect(groupByTextValue(true)).toBe("true");
    expect(groupByTextValue(false)).toBe("");
    expect(groupByTextValue(undefined)).toBe("");
    expect(groupByValue({ name: "Alpha" })).toBeNull();
  });
});
