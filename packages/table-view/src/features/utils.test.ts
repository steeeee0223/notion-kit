import { describe, expect, it } from "vitest";

import { reorderByIds } from "./utils";

describe("reorderByIds", () => {
  it("reorders all items by id", () => {
    expect(reorderByIds(["a", "b", "c"], ["c", "a", "b"], (id) => id)).toEqual([
      "c",
      "a",
      "b",
    ]);
  });

  it("preserves slots for items omitted from the ordered ids", () => {
    expect(reorderByIds(["a", "deleted", "b"], ["b", "a"], (id) => id)).toEqual(
      ["b", "deleted", "a"],
    );
  });

  it("returns the original items when an ordered id is missing", () => {
    const items = ["a", "b"];

    expect(reorderByIds(items, ["missing", "a"], (id) => id)).toBe(items);
  });

  it("returns the original items when ordered ids contain duplicates", () => {
    const items = ["a", "b"];

    expect(reorderByIds(items, ["a", "a"], (id) => id)).toBe(items);
  });
});
