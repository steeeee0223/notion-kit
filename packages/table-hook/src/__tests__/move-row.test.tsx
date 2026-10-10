import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { ColumnInfo, Row } from "@/lib/types";
import { arrayToEntity } from "@/lib/utils";
import { checkbox, multiSelect, number, select, text } from "@/plugins";
import type {
  DataResourceAction,
  ResourceChange,
} from "@/table-contexts/actions";
import { useTableView } from "@/table-contexts/use-table-view";

const properties: ColumnInfo[] = [
  {
    id: "status",
    name: "Status",
    type: "select",
    width: "150",
    config: undefined,
  },
];
const data: Row[] = ["TODO", "DONE", "TODO"].map((value, index) => ({
  id: `row${index}`,
  createdAt: 1,
  lastEditedAt: 1,
  properties: { status: { id: `cell${index}`, value } },
}));

function setup(rows = data, columns = properties) {
  const onDataChange =
    vi.fn<(change: ResourceChange<Row[], DataResourceAction>) => void>();
  const { result: hook } = renderHook(() =>
    useTableView({
      defaultData: rows,
      defaultProperties: columns,
      plugins: arrayToEntity([
        select(),
        multiSelect(),
        number(),
        text(),
        checkbox(),
      ]),
      onDataChange,
    }),
  );
  const result = hook.current;
  act(() => result.table.setGrouping(["status"]));
  return { ...result, onDataChange };
}

describe("semantic row moves", () => {
  it("commits grouping and position together while preserving unrelated rows and cell identity", () => {
    const { table, onDataChange } = setup();
    act(() =>
      table.moveRow({
        rowId: "row0",
        groupId: "status:DONE",
        beforeRowId: null,
      }),
    );
    expect(onDataChange).toHaveBeenCalledOnce();
    const change = onDataChange.mock.lastCall![0];
    expect(change.next.map((row) => row.id)).toEqual(["row1", "row0", "row2"]);
    expect(change.next[0]).toBe(data[1]);
    expect(change.next[2]).toBe(data[2]);
    expect(change.next[1]?.properties.status).toEqual({
      id: "cell0",
      value: "DONE",
    });
    expect(change.action).toMatchObject({
      type: "data.row.move",
      payload: {
        rowId: "row0",
        previousPosition: 0,
        nextPosition: 1,
        grouping: {
          propertyId: "status",
          previousValue: "TODO",
          nextValue: "DONE",
        },
      },
    });
  });

  it("inserts before an ID and leaves interleaved groups in their relative order", () => {
    const { table, onDataChange } = setup();
    act(() =>
      table.moveRow({
        rowId: "row2",
        groupId: "status:TODO",
        beforeRowId: "row0",
      }),
    );
    const change = onDataChange.mock.lastCall![0];
    expect(change.next.map((row) => row.id)).toEqual(["row2", "row0", "row1"]);
    expect(change.next[0]).toBe(data[2]);
    expect(change.action.payload).not.toHaveProperty("grouping");
  });

  it.each([
    { rowId: "row2", groupId: "status:TODO", beforeRowId: null },
    { rowId: "missing", groupId: "status:DONE", beforeRowId: null },
    { rowId: "row0", groupId: "status:missing", beforeRowId: null },
    { rowId: "row0", groupId: "status:DONE", beforeRowId: "row2" },
    { rowId: "row0", groupId: "status:TODO", beforeRowId: "missing" },
    { rowId: "row0", groupId: "status:TODO", beforeRowId: "row0" },
  ])(
    "rejects invalid or unchanged placement %j without a proposal",
    (intent) => {
      const { table, onDataChange } = setup();
      act(() => table.moveRow(intent));
      expect(onDataChange).not.toHaveBeenCalled();
    },
  );

  it("preserves edits made before a completed move", () => {
    const { table, onDataChange } = setup();
    act(() =>
      table.updateCell("row2", "status", (cell) => ({
        ...cell,
        note: "concurrent",
      })),
    );
    onDataChange.mockClear();
    act(() =>
      table.moveRow({
        rowId: "row0",
        groupId: "status:DONE",
        beforeRowId: null,
      }),
    );
    expect(
      onDataChange.mock.lastCall![0].next.find((row) => row.id === "row2")
        ?.properties.status,
    ).toHaveProperty("note", "concurrent");
  });

  it("preserves extra multiselect options and clears explicitly", () => {
    const rows = data.map((row, index) => ({
      ...row,
      properties: {
        status: {
          ...row.properties.status!,
          value:
            index === 0
              ? ["TODO", "OTHER", "DONE"]
              : index === 1
                ? ["DONE"]
                : [],
        },
      },
    }));
    const columns = properties.map((column) => ({
      ...column,
      type: "multi-select",
    }));
    const { table, onDataChange } = setup(rows, columns);
    act(() =>
      table.moveRow({
        rowId: "row0",
        groupId: "status:DONE",
        beforeRowId: null,
      }),
    );
    expect(table.getRow("row0").original.properties.status?.value).toEqual([
      "DONE",
      "OTHER",
    ]);
    onDataChange.mockClear();
    act(() =>
      table.moveRow({
        rowId: "row0",
        groupId: "status:null",
        beforeRowId: null,
      }),
    );
    expect(table.getRow("row0").original.properties.status?.value).toEqual([]);
    expect(onDataChange).toHaveBeenCalledOnce();
  });

  it("allows same-group movement but refuses number bucket transfers", () => {
    const rows = data.map((row, index) => ({
      ...row,
      properties: {
        status: {
          ...row.properties.status!,
          value: index === 1 ? "2.4" : "1.7",
        },
      },
    }));
    const { table, onDataChange } = setup(
      rows,
      properties.map((column) => ({ ...column, type: "number" })),
    );
    expect(table.getCanMoveRowToGroup("row0", "status:2")).toBe(false);
    act(() =>
      table.moveRow({ rowId: "row0", groupId: "status:2", beforeRowId: null }),
    );
    expect(onDataChange).not.toHaveBeenCalled();
    act(() =>
      table.moveRow({
        rowId: "row2",
        groupId: "status:1",
        beforeRowId: "row0",
      }),
    );
    expect(onDataChange).toHaveBeenCalledOnce();
  });

  it("rejects removed sources", () => {
    const { table, onDataChange } = setup();
    act(() => table.deleteRow("row0"));
    onDataChange.mockClear();
    act(() =>
      table.moveRow({
        rowId: "row0",
        groupId: "status:DONE",
        beforeRowId: null,
      }),
    );
    expect(onDataChange).not.toHaveBeenCalled();
  });

  it("refuses locked row and group commands", () => {
    const { table, onDataChange } = setup();
    const order = table.atoms.groupingState.get().groupOrder;
    act(() => table.toggleTableLocked());
    act(() => {
      table.moveRow({
        rowId: "row0",
        groupId: "status:DONE",
        beforeRowId: null,
      });
      table.moveGroup({ groupId: "status:DONE", beforeGroupId: "status:TODO" });
    });
    expect(onDataChange).not.toHaveBeenCalled();
    expect(table.atoms.groupingState.get().groupOrder).toEqual(order);
  });

  it("uses the selected method and refuses alphabetical transfers", () => {
    const rows = data.map((row, index) => ({
      ...row,
      properties: {
        status: {
          ...row.properties.status!,
          value: index === 1 ? "Beta" : "Alpha",
        },
      },
    }));
    const { table, onDataChange } = setup(
      rows,
      properties.map((column) => ({ ...column, type: "text" })),
    );
    expect(table.getCanMoveRowToGroup("row0", "status:Beta")).toBe(true);
    act(() => table.setColumnGroupingMethod("status", "alphabetical"));
    expect(table.getCanMoveRowToGroup("row0", "status:B")).toBe(false);
    act(() =>
      table.moveRow({ rowId: "row0", groupId: "status:B", beforeRowId: null }),
    );
    expect(onDataChange).not.toHaveBeenCalled();
    act(() =>
      table.moveRow({
        rowId: "row2",
        groupId: "status:A",
        beforeRowId: "row0",
      }),
    );
    expect(onDataChange).toHaveBeenCalledOnce();
  });

  it("refuses hidden anchors while preserving filtered rows on valid moves", () => {
    const { table, onDataChange } = setup();
    act(() => table.setGlobalFilter("TODO"));
    act(() => table.moveRow({ rowId: "row2", beforeRowId: "row1" }));
    expect(onDataChange).not.toHaveBeenCalled();
    act(() => table.moveRow({ rowId: "row2", beforeRowId: "row0" }));
    expect(onDataChange.mock.lastCall![0].next.map((row) => row.id)).toEqual([
      "row2",
      "row0",
      "row1",
    ]);
    expect(onDataChange.mock.lastCall![0].next[2]).toBe(data[1]);
  });

  it("revalidates a plugin's destination value rather than trusting its inverse", () => {
    const plugin = select();
    plugin.grouping!.methods[0]!.getDropValue = () => "WRONG";
    const onDataChange = vi.fn();
    const { result } = renderHook(() =>
      useTableView({
        defaultData: data,
        defaultProperties: properties,
        plugins: arrayToEntity([plugin]),
        onDataChange,
      }),
    );
    act(() => result.current.table.setGrouping(["status"]));
    expect(
      result.current.table.getCanMoveRowToGroup("row0", "status:DONE"),
    ).toBe(false);
    act(() =>
      result.current.table.moveRow({
        rowId: "row0",
        groupId: "status:DONE",
        beforeRowId: null,
      }),
    );
    expect(onDataChange).not.toHaveBeenCalled();
  });

  it("starts another controlled proposal from authoritative data after rejection", () => {
    const onDataChange =
      vi.fn<(change: ResourceChange<Row[], DataResourceAction>) => void>();
    const { result, rerender } = renderHook(() =>
      useTableView({
        data,
        defaultProperties: properties,
        plugins: arrayToEntity([select()]),
        onDataChange,
      }),
    );
    act(() => result.current.table.setGrouping(["status"]));
    act(() =>
      result.current.table.moveRow({
        rowId: "row0",
        groupId: "status:DONE",
        beforeRowId: null,
      }),
    );
    expect(
      result.current.table.getRow("row0").original.properties.status?.value,
    ).toBe("TODO");
    rerender();
    act(() =>
      result.current.table.moveRow({
        rowId: "row2",
        groupId: "status:TODO",
        beforeRowId: "row0",
      }),
    );
    expect(onDataChange).toHaveBeenCalledTimes(2);
    expect(
      onDataChange.mock.lastCall![0].next.find((row) => row.id === "row0")
        ?.properties.status?.value,
    ).toBe("TODO");
  });

  it("writes named empty categories without borrowing a representative row", () => {
    const columns = properties.map((column) => ({
      ...column,
      config: {
        sort: "manual",
        options: { names: ["TODO", "DONE", "EMPTY"], items: {} },
      },
    }));
    const { table, onDataChange } = setup(data, columns);
    expect(table.atoms.groupingState.get().groupOrder).toContain(
      "status:EMPTY",
    );
    expect(table.getCanMoveRowToGroup("row0", "status:EMPTY")).toBe(true);
    act(() =>
      table.moveRow({
        rowId: "row0",
        groupId: "status:EMPTY",
        beforeRowId: null,
      }),
    );
    expect(onDataChange.mock.lastCall![0].next.map((row) => row.id)).toEqual([
      "row1",
      "row2",
      "row0",
    ]);
    expect(table.getRow("row0").original.properties.status?.value).toBe(
      "EMPTY",
    );
  });

  it("refreshes empty destinations when controlled property options change", () => {
    const columns = (names: string[]): ColumnInfo[] =>
      properties.map((column) => ({
        ...column,
        config: {
          sort: "manual",
          options: { names, items: {} },
        },
      }));
    const plugins = arrayToEntity([select()]);
    const view = {
      pluginMethods: {
        groupingMethodByColumn: {},
        groupSort: { mode: "manual" as const },
      },
    };
    const { result, rerender } = renderHook(
      ({ columns }) =>
        useTableView({ data, properties: columns, plugins, view }),
      { initialProps: { columns: columns(["TODO", "DONE"]) } },
    );
    const { table } = result.current;
    act(() => table.setGrouping(["status"]));
    expect(table.getCanMoveRowToGroup("row0", "status:EMPTY")).toBe(false);

    rerender({ columns: columns(["TODO", "DONE", "EMPTY"]) });
    expect(table.atoms.groupingState.get().groupOrder).toContain(
      "status:EMPTY",
    );
    expect(table.getCanMoveRowToGroup("row0", "status:EMPTY")).toBe(true);

    rerender({ columns: columns(["TODO", "DONE"]) });
    expect(table.atoms.groupingState.get().groupOrder).not.toContain(
      "status:EMPTY",
    );
    expect(table.getCanMoveRowToGroup("row0", "status:EMPTY")).toBe(false);
    expect(result.current.table.options.data).toBe(data);
  });

  it("moves group order semantically and ignores no-ops", () => {
    const { table } = setup();
    act(() =>
      table.moveGroup({ groupId: "status:DONE", beforeGroupId: "status:TODO" }),
    );
    expect(table.atoms.groupingState.get().groupOrder).toEqual([
      "status:DONE",
      "status:TODO",
      "status:null",
    ]);
    act(() =>
      table.moveGroup({ groupId: "status:DONE", beforeGroupId: "missing" }),
    );
    expect(table.atoms.groupingState.get().groupOrder).toEqual([
      "status:DONE",
      "status:TODO",
      "status:null",
    ]);
  });
});
