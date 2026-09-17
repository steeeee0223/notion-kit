import { describe, expect, it } from "vitest";

import { rowEditLogPageSchema, tableEditLogPageSchema } from "./schemas";

const tableRecord = {
  id: "log-1",
  editedAt: 1_700_000_000_000,
  action: "future-action",
  target: { name: "Old property" },
  summary: "Updated property",
};
const rowRecord = {
  id: "row-log-1",
  editedAt: tableRecord.editedAt,
  rowId: "row-1",
  property: { id: "property-1", name: "Old name", type: "future-type" },
  value: null,
  textValue: "Empty",
};

describe("edit log response validation", () => {
  it("preserves unknown actions, types, and historical values", () => {
    expect(
      tableEditLogPageSchema.parse({ items: [tableRecord], nextCursor: "next" })
        .items,
    ).toEqual([tableRecord]);
    expect(
      rowEditLogPageSchema("row-1").parse({
        items: [rowRecord],
        nextCursor: null,
      }).items,
    ).toEqual([rowRecord]);
  });

  it.each([NaN, Infinity, 8_640_000_000_000_001, 1.1])(
    "rejects an invalid timestamp %s",
    (editedAt) => {
      expect(
        tableEditLogPageSchema.safeParse({
          items: [{ ...tableRecord, editedAt }],
          nextCursor: null,
        }).success,
      ).toBe(false);
    },
  );

  it("rejects malformed envelopes, identifiers, icons and another row's records", () => {
    for (const page of [
      { items: [tableRecord] },
      { items: [{ ...tableRecord, id: "" }], nextCursor: null },
      { items: [tableRecord], nextCursor: "" },
      { items: [{ ...tableRecord, summary: undefined }], nextCursor: null },
    ])
      expect(tableEditLogPageSchema.safeParse(page).success).toBe(false);
    expect(
      rowEditLogPageSchema("row-2").safeParse({
        items: [rowRecord],
        nextCursor: null,
      }).success,
    ).toBe(false);
    expect(
      rowEditLogPageSchema("row-1").safeParse({
        items: [
          {
            ...rowRecord,
            property: {
              ...rowRecord.property,
              icon: { type: "bad", src: "x" },
            },
          },
        ],
        nextCursor: null,
      }).success,
    ).toBe(false);
    const { value: _value, ...missingValue } = rowRecord;
    expect(
      rowEditLogPageSchema("row-1").safeParse({
        items: [missingValue],
        nextCursor: null,
      }).success,
    ).toBe(false);
  });
});
