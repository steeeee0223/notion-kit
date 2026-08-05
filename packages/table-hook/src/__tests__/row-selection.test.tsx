import { act, renderHook } from "@testing-library/react";
import { expect, it } from "vitest";

import { mockData, mockProperties, plugins } from "@/__tests__/mock";
import { useTableView } from "@/table-contexts/use-table-view";

it("UseTableView_RowSelectionWithoutPublicProps_OwnsInternalSelectionState", () => {
  const { result } = renderHook(() =>
    useTableView({
      plugins,
      defaultData: mockData,
      defaultProperties: mockProperties,
    }),
  );

  expect(result.current.table.getSelectedRowIds()).toEqual([]);

  act(() => {
    result.current.table.getRow("row1").toggleSelected(true);
  });

  expect(result.current.table.getSelectedRowIds()).toEqual(["row1"]);
});

it("UseTableView_SelectedRowRemoved_PrunesStaleSelectionId", () => {
  const { result } = renderHook(() =>
    useTableView({
      plugins,
      defaultData: mockData,
      defaultProperties: mockProperties,
    }),
  );

  act(() => {
    result.current.table.getRow("row1").toggleSelected(true);
    result.current.table.deleteRows(["row1"]);
  });

  expect(result.current.table.getSelectedRowIds()).toEqual([]);
});

it("UseTableView_ReusedDeletedRowId_DoesNotRestoreSelection", () => {
  const { result } = renderHook(() =>
    useTableView({
      plugins,
      defaultData: mockData,
      defaultProperties: mockProperties,
    }),
  );

  act(() => {
    result.current.table.getRow("row1").toggleSelected(true);
    result.current.table.deleteRows(["row1"]);
    result.current.table.setTableData((rows) => [
      ...rows,
      { ...mockData[0]!, createdAt: 1, lastEditedAt: 1 },
    ], {
      id: "reuse-row1",
      type: "data.row.create",
      payload: { rowId: "row1", nextPosition: 2 },
    });
  });

  expect(result.current.table.getRow("row1").getIsSelected()).toBe(false);
});

it("UseTableView_ViewBecomesLocked_ClearsSelectionState", () => {
  const { result } = renderHook(() =>
    useTableView({
      plugins,
      defaultData: mockData,
      defaultProperties: mockProperties,
    }),
  );

  act(() => {
    result.current.table.getRow("row1").toggleSelected(true);
    result.current.table.toggleTableLocked();
  });

  expect(result.current.table.getSelectedRowIds()).toEqual([]);
});

it("UseTableView_LayoutChanges_PreservesSelectionState", () => {
  const { result } = renderHook(() =>
    useTableView({
      plugins,
      defaultData: mockData,
      defaultProperties: mockProperties,
    }),
  );

  act(() => {
    result.current.table.getRow("row1").toggleSelected(true);
    result.current.table.setTableLayout("list");
  });

  expect(result.current.table.getSelectedRowIds()).toEqual(["row1"]);
});

it("UseTableView_GroupToggle_SelectsOnlyDescendantLeafIds", () => {
  const { result } = renderHook(() =>
    useTableView({
      plugins,
      defaultData: mockData,
      defaultProperties: mockProperties,
    }),
  );

  act(() => {
    result.current.table.setGrouping(["col2"]);
    const group = result.current.table
      .getGroupedRowModel()
      .rows.find((row) => row.getIsGrouped());
    group?.toggleGroupSelection();
  });

  expect(result.current.table.getSelectedRowIds()).toEqual(["row1", "row3"]);
});

it("UseTableView_GroupedRowDirectToggle_PrunesSyntheticGroupId", () => {
  const { result } = renderHook(() =>
    useTableView({
      plugins,
      defaultData: mockData,
      defaultProperties: mockProperties,
    }),
  );

  act(() => {
    result.current.table.setGrouping(["col2"]);
    const group = result.current.table
      .getGroupedRowModel()
      .rows.find((row) => row.getIsGrouped());
    group?.toggleSelected(true);
  });

  expect(result.current.table.getSelectedRowIds()).toEqual(["row1", "row3"]);
});

it("UseTableView_GroupedRangeToggle_PrunesSyntheticGroupIds", () => {
  const { result } = renderHook(() =>
    useTableView({
      plugins,
      defaultData: mockData,
      defaultProperties: mockProperties,
    }),
  );

  act(() => {
    result.current.table.setGrouping(["col2"]);
    const groups = result.current.table
      .getGroupedRowModel()
      .rows.filter((row) => row.getIsGrouped());
    groups[0]?.getToggleSelectedHandler()({ target: { checked: true } });
    groups[1]?.getToggleSelectedHandler()({
      target: { checked: true },
      shiftKey: true,
    });
  });

  expect(result.current.table.getSelectedRowIds()).toHaveLength(3);
  expect(result.current.table.getSelectedRowIds()).toEqual(
    expect.arrayContaining(["row1", "row2", "row3"]),
  );
});
