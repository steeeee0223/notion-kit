import { describe, expect, it } from "vitest";

import type { CellPlugin } from "@notion-kit/table-hook";

import { text } from "@/plugins";

import {
  getDefaultSortingMethod,
  getSortingDirectionLabels,
} from "./sorting-options";

describe("sorting options", () => {
  it("uses generic labels when a method has no direction metadata", () => {
    expect(getSortingDirectionLabels(undefined)).toEqual({
      ascending: "Ascending",
      descending: "Descending",
    });
    expect(
      getSortingDirectionLabels({
        id: "inline",
        name: "Inline",
        function: () => 0,
      }),
    ).toEqual({ ascending: "Ascending", descending: "Descending" });
  });

  it("falls back to the first method and handles plugins without sorting", () => {
    const plugin = text();
    expect(
      getDefaultSortingMethod({
        ...plugin,
        sorting: { ...plugin.sorting!, defaultMethod: "missing" },
      })!.id,
    ).toBe("text");
    expect(
      getDefaultSortingMethod({ ...plugin, sorting: undefined } as CellPlugin),
    ).toBeUndefined();
  });
});
