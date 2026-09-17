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

  it("copies inputs and responses and isolates factory instances", async () => {
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
    first.items[0]!.property.name = "Mutated response";
    expect(
      (await api.fetchRowEditLogs({ ...request(), rowId })).items[0]!.property
        .name,
    ).toBe(original.properties[0]!.name);
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

  it("honors abort before and during a request and rejects invalid boundaries", async () => {
    const fixture = createMockFullTableFixture();
    for (const pageSize of [0, -1, 1.5, Number.NaN]) {
      expect(() => createMockEditLogApi({ ...fixture, pageSize })).toThrow();
    }
    const api = createMockEditLogApi({ ...fixture, pageSize: 3 });
    const page = await api.fetchTableEditLogs(request());
    expect(page.items).toHaveLength(3);
    for (const cursor of ["garbage", "", "table:9999", "table:1"]) {
      await expect(
        api.fetchTableEditLogs({ ...request(), cursor }),
      ).rejects.toThrow();
    }
    await expect(
      api.fetchRowEditLogs({
        ...request(),
        rowId: fixture.data[0]!.id,
        cursor: page.nextCursor!,
      }),
    ).rejects.toThrow();
    const aborted = new AbortController();
    aborted.abort();
    await expect(
      api.fetchTableEditLogs({ signal: aborted.signal }),
    ).rejects.toMatchObject({ name: "AbortError" });
    const controller = new AbortController();
    const pending = api.fetchTableEditLogs({ signal: controller.signal });
    controller.abort();
    await expect(pending).rejects.toMatchObject({ name: "AbortError" });
  });
});
