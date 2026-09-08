import { act, renderHook } from "@testing-library/react";
import { expect, it } from "vitest";

import { mockData, mockProperties, plugins } from "@/__tests__/mock";
import { useTableView } from "@/table-contexts/use-table-view";

function setup() {
  return renderHook(
    ({ layout }: { layout: "table" | "list" }) =>
      useTableView({
        plugins,
        defaultData: mockData,
        defaultProperties: mockProperties,
        view: { layout },
      }),
    { initialProps: { layout: "table" as "table" | "list" } },
  );
}

it("disables cell selection outside table layout and clears the old range", () => {
  const { result, rerender } = setup();
  const cell = result.current.table.getRow("row1").getAllCells()[0]!;
  act(() => result.current.table.setFocusedCell(cell.row.id, cell.column.id));
  rerender({ layout: "list" });
  expect(
    result.current.table.getRow("row1").getAllCells()[0]!.getCanSelect(),
  ).toBe(false);
  expect(result.current.table.atoms.cellSelection.get()).toEqual([]);
});

it("preserves selected cells across value edits but removes deleted endpoints", () => {
  const { result } = setup();
  const cell = result.current.table.getRow("row1").getAllCells()[0]!;
  act(() => result.current.table.setFocusedCell(cell.row.id, cell.column.id));
  act(() => cell.update("Edited"));
  expect(result.current.table.getFocusedCell()?.id).toBe(cell.id);
  act(() => result.current.table.deleteRows([cell.row.id]));
  expect(result.current.table.atoms.cellSelection.get()).toEqual([]);
});

it("selects all plugin-backed data cells in locked tables", () => {
  const { result } = renderHook(() =>
    useTableView({
      plugins,
      defaultData: mockData,
      defaultProperties: mockProperties,
      defaultView: { locked: true },
    }),
  );
  act(() => result.current.table.selectAllCells());
  for (const row of result.current.table.getRowsInDisplayOrder()) {
    for (const cell of row.getVisibleCells())
      expect(cell.getIsSelected()).toBe(true);
  }
});

it("excludes group headings and clears an endpoint after its group collapses", () => {
  const { result } = setup();
  const table = result.current.table;
  act(() => {
    table.setGrouping(["col2"]);
    table.setExpanded(true);
  });
  const group = table
    .getRowsInDisplayOrder()
    .find((row) => row.getIsGrouped())!;
  expect(group.getAllCells()[0]!.getCanSelect()).toBe(false);
  const child = group.subRows[0]!;
  act(() => table.setFocusedCell(child.id, "col1"));
  act(() => group.toggleExpanded(false));
  expect(table.atoms.cellSelection.get()).toEqual([]);
});

it("clears a hidden-column endpoint and excludes that column from select-all", () => {
  const { result } = setup();
  const table = result.current.table;
  act(() => table.setFocusedCell("row1", "col2"));
  act(() => table.setColumnInfo("col2", { hidden: true }));
  expect(table.atoms.cellSelection.get()).toEqual([]);
  act(() => table.selectAllCells());
  expect(
    table
      .getRow("row1")
      .getAllCells()
      .find((cell) => cell.column.id === "col2")!
      .getIsSelected(),
  ).toBe(false);
});
