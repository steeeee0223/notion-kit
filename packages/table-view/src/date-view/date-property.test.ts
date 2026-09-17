import { describe, expect, it } from "vitest";

import type { ColumnInfo } from "@notion-kit/table-hook";

import { getDatePropertyTimeZone, resolveDateProperty } from "./date-property";

const dateProperty = {
  id: "due",
  name: "Due",
  type: "date",
  config: {},
} satisfies ColumnInfo;

const properties = [
  { id: "title", name: "Name", type: "title", config: {} },
  dateProperty,
  { ...dateProperty, id: "later", name: "Later" },
] satisfies ColumnInfo[];

describe("shared date property selection", () => {
  it.each([
    ["null", null],
    ["missing", "missing"],
    ["hidden", "hidden"],
    ["deleted", "deleted"],
    ["wrong type", "title"],
  ])(
    "ResolveDateProperty_%sPersistedId_ReturnsFirstUsableDate",
    (_scenario, persistedId) => {
      const candidates: ColumnInfo[] = [
        properties[0]!,
        { ...dateProperty, id: "hidden", hidden: true },
        { ...dateProperty, id: "deleted", isDeleted: true },
        ...properties.slice(1),
      ];

      expect(resolveDateProperty(candidates, persistedId)?.id).toBe("due");
    },
  );

  it("ResolveDateProperty_UsablePersistedLastProperty_ReturnsPersistedProperty", () => {
    expect(resolveDateProperty(properties, "later")?.id).toBe("later");
  });

  it.each([
    ["America/New_York", "America/New_York"],
    ["invalid-zone", "UTC"],
  ])(
    "DatePropertyTimeZone_%s_ResolvesAtThePropertyBoundary",
    (tz, expected) => {
      expect(getDatePropertyTimeZone({ ...dateProperty, config: { tz } })).toBe(
        expected,
      );
    },
  );

  it("ResolveDateProperty_NoUsableDate_ReturnsNull", () => {
    expect(
      resolveDateProperty(
        [properties[0]!, { ...dateProperty, hidden: true }],
        null,
      ),
    ).toBeNull();
  });
});
