import { act, renderHook } from "@testing-library/react";
import { expect, it } from "vitest";

import {
  arrayToEntity,
  DEFAULT_PLUGINS,
  useTableView,
} from "@notion-kit/table-view";

import { useTableWithEditLogs } from "../../../examples/notion-table/src/lib/use-table-with-edit-logs";

it("TestNotionTable_CellEdits_PreservesSnapshotsAndSeparatesRowHistory", async () => {
  const { result } = renderHook(() => useTableWithEditLogs());
  const signal = new AbortController().signal;
  expect(await result.current.fetchTableEditLogs({ signal })).toEqual({
    items: [],
    nextCursor: null,
  });

  const next = structuredClone(result.current.data);
  next[0]!.properties["col-2"]!.value = "First edit";
  act(() =>
    result.current.onDataChange({
      next,
      action: {
        id: "edit-1",
        type: "data.cell.update",
        payload: {
          rowId: "row-1",
          propertyId: "col-2",
          nextValue: "First edit",
        },
      },
    }),
  );
  // A later live-data change must not mutate the captured history.
  next[0]!.properties["col-2"]!.value = "Second edit";
  act(() =>
    result.current.onDataChange({
      next: structuredClone(next),
      action: {
        id: "edit-2",
        type: "data.cell.update",
        payload: {
          rowId: "row-1",
          propertyId: "col-2",
          nextValue: "Second edit",
        },
      },
    }),
  );
  act(() =>
    result.current.onPropertiesChange({
      next: result.current.properties.filter(
        (property) => property.id !== "col-2",
      ),
      action: {
        id: "delete",
        type: "properties.delete",
        payload: { propertyId: "col-2", previousPosition: 1 },
      },
    }),
  );

  const rows = await result.current.fetchRowEditLogs({
    rowId: "row-1",
    signal,
  });
  expect(
    rows.items.map((record) => ({
      name: record.property.name,
      value: record.value,
    })),
  ).toEqual([
    { name: "Desc.", value: "Second edit" },
    { name: "Desc.", value: "First edit" },
  ]);
  expect(
    (await result.current.fetchRowEditLogs({ rowId: "row-2", signal })).items,
  ).toEqual([]);
  const table = await result.current.fetchTableEditLogs({ signal });
  expect(table.items.map((record) => record.action)).toEqual([
    "delete",
    "update",
    "update",
  ]);
  expect(table.items[0]?.property).toBeUndefined();
  expect(table.items[1]).toMatchObject({
    target: { name: "TODO 1" },
    cell: {
      property: { name: "Desc.", type: "text" },
      value: "Second edit",
      textValue: "Second edit",
    },
  });
});

it("TestNotionTable_PropertyOperation_RecordsOneActionWithoutCellInitialization", async () => {
  const { result } = renderHook(() => useTableWithEditLogs());
  const property = { id: "new", name: "Notes", type: "text", config: {} };
  act(() =>
    result.current.onPropertiesChange({
      next: [...result.current.properties, property],
      action: {
        id: "create",
        type: "properties.create",
        payload: { propertyId: "new", nextPosition: 6, property },
      },
    }),
  );
  act(() =>
    result.current.onDataChange({
      next: result.current.data.map((row) => ({
        ...row,
        properties: {
          ...row.properties,
          new: { id: `${row.id}-new`, value: "" },
        },
      })),
      action: {
        id: "create",
        type: "data.cell.update",
        payload: {
          propertyId: "new",
          rowIds: result.current.data.map((row) => row.id),
        },
      },
    }),
  );
  act(() =>
    result.current.onViewChange({
      next: { layout: "list", rowView: "side", openedRowId: null },
      action: {
        id: "layout",
        type: "view.layout.change",
        payload: { previousLayout: "table", nextLayout: "list" },
      },
    }),
  );
  const history = await result.current.fetchTableEditLogs({
    signal: new AbortController().signal,
  });
  expect(
    (
      await result.current.fetchRowEditLogs({
        rowId: "row-1",
        signal: new AbortController().signal,
      })
    ).items,
  ).toEqual([]);
  expect(
    history.items.map((record) => ({
      action: record.action,
      property: record.property,
    })),
  ).toEqual([
    {
      action: "change-layout",
      property: undefined,
    },
    { action: "create", property: undefined },
  ]);
});

it.each([
  ["col-4", { options: { names: [], items: {} } }],
  ["col-6", { dateFormat: "relative", timeFormat: "hidden" }],
])(
  "TestNotionTable_ConfigUpdateFor%s_RecordsSettingsInsteadOfRename",
  async (propertyId, config) => {
    const { result } = renderHook(() => {
      const model = useTableWithEditLogs();
      const { table } = useTableView({
        ...model,
        plugins: arrayToEntity(DEFAULT_PLUGINS.data),
      });
      return { model, table };
    });
    act(() => result.current.table.setColumnInfo(propertyId, { config }));
    const signal = new AbortController().signal;
    expect(
      (await result.current.model.fetchTableEditLogs({ signal })).items[0],
    ).toMatchObject({ action: "update-config" });

    act(() =>
      result.current.table.setColumnInfo(propertyId, { name: "Renamed" }),
    );
    expect(
      (await result.current.model.fetchTableEditLogs({ signal })).items[0],
    ).toMatchObject({ action: "rename", target: { name: "Renamed" } });
  },
);

it("TestNotionTable_ViewAndPropertyActions_DescribeTheResult", async () => {
  const { result } = renderHook(() => {
    const model = useTableWithEditLogs();
    const { table } = useTableView({
      ...model,
      plugins: arrayToEntity(DEFAULT_PLUGINS.data),
    });
    return { model, table };
  });
  act(() => result.current.table.toggleTableLocked());
  act(() => result.current.table.toggleTableLocked());
  act(() => result.current.table.setTableLayout("board"));
  act(() => result.current.table.setColumnType("col-2", "select"));
  const history = await result.current.model.fetchTableEditLogs({
    signal: new AbortController().signal,
  });
  expect(history.items).toMatchObject([
    {
      action: "change-type",
      target: { name: "Desc." },
      property: { type: "select" },
    },
    {
      action: "change-layout",
      layout: "board",
      target: { name: "View" },
    },
    { action: "unlock" },
    { action: "lock" },
  ]);
});
