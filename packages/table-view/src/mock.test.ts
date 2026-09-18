import { describe, expect, it } from "vitest";

import { createMockFullTableFixture } from "@notion-kit/table-hook/mock";

import {
  rowEditLogPageSchema,
  tableEditLogPageSchema,
} from "./edit-log/schemas";
import { createMockEditLogApi } from "./mock";

const request = () => ({ signal: new AbortController().signal });

describe("MockEditLogApi_StaticSnapshots", () => {
  it("paginates both histories in stable order and resolves timestamp values", async () => {
    const fixture = createMockFullTableFixture();
    const api = createMockEditLogApi(fixture);
    const first = tableEditLogPageSchema.parse(
      await api.fetchTableEditLogs(request()),
    );
    expect(first.items).toHaveLength(10);
    expect(first.nextCursor).not.toBeNull();
    const next = await api.fetchTableEditLogs({
      ...request(),
      cursor: first.nextCursor!,
    });
    expect(next.items.length).toBeGreaterThan(0);
    expect(next.nextCursor).toBeNull();
    expect(
      new Set([...first.items, ...next.items].map((item) => item.id)).size,
    ).toBe(first.items.length + next.items.length);
    expect(first.items[0]!.editedAt).toBeGreaterThanOrEqual(
      next.items[0]!.editedAt,
    );
    const rowId = fixture.data[0]!.id;
    const rowPage = rowEditLogPageSchema(rowId).parse(
      await api.fetchRowEditLogs({ ...request(), rowId }),
    );
    expect(rowPage.items).toHaveLength(10);
    expect(rowPage.nextCursor).not.toBeNull();
    const rest = await api.fetchRowEditLogs({
      ...request(),
      rowId,
      cursor: rowPage.nextCursor!,
    });
    const records = [...rowPage.items, ...rest.items];
    for (const property of fixture.properties) {
      expect(records.some((record) => record.property.id === property.id)).toBe(
        true,
      );
    }
    for (const record of records.filter((item) =>
      ["created-time", "last-edited-time"].includes(item.property.type),
    )) {
      expect(typeof record.value).toBe("number");
    }
    expect(
      await api.fetchRowEditLogs({ ...request(), rowId: "new-row" }),
    ).toEqual({ items: [], nextCursor: null });
    expect(await api.fetchTableEditLogs(request())).toEqual(first);
  });

  it("TestMockEditLogApi_LiveDataChanges_PreservesIndependentSnapshots", async () => {
    const fixture = createMockFullTableFixture();
    const original = structuredClone(fixture);
    const api = createMockEditLogApi(fixture);
    const rowId = fixture.data[0]!.id;
    const first = await api.fetchRowEditLogs({ ...request(), rowId });
    expect(fixture).toEqual(original);
    fixture.properties[0]!.name = "Changed live property";
    fixture.data[0]!.properties[fixture.properties[0]!.id]!.value =
      "Changed live value";
    const other = createMockEditLogApi(fixture);
    expect(await api.fetchRowEditLogs({ ...request(), rowId })).toEqual(first);
    expect(await other.fetchRowEditLogs({ ...request(), rowId })).not.toEqual(
      first,
    );
  });

  it("keeps custom object values meaningful in the text fallback", async () => {
    const api = createMockEditLogApi({
      properties: [
        {
          id: "custom",
          name: "Custom",
          type: "custom",
          width: "100",
          config: undefined,
        },
      ],
      data: [
        {
          id: "custom-row",
          createdAt: 0,
          lastEditedAt: 0,
          properties: {
            custom: { id: "custom-cell", value: { name: "Approved" } },
          },
        },
      ],
    });
    const page = await api.fetchRowEditLogs({
      ...request(),
      rowId: "custom-row",
    });
    expect(page.items[0]!.textValue).toBe('{"name":"Approved"}');
  });

  it("TestMockEditLogApi_ZeroPageSize_RejectsNonAdvancingPagination", () => {
    expect(() =>
      createMockEditLogApi({ ...createMockFullTableFixture(), pageSize: 0 }),
    ).toThrow();
  });
});
