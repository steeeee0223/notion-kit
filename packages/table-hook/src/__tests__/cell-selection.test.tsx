import { act, renderHook } from "@testing-library/react";
import { expect, it } from "vitest";

import { mockData, mockProperties, plugins } from "@/__tests__/mock";
import { useTableView } from "@/table-contexts/use-table-view";

it("UseTableView_CellSelection_UsesStableRowIdsForRangeFocusAndReset", () => {
  const { result } = renderHook(() =>
    useTableView({
      plugins,
      defaultData: mockData,
      defaultProperties: mockProperties,
    }),
  );

  act(() => {
    result.current.table.selectCellRange({
      anchorRowId: "row1",
      anchorColumnId: "col1",
      focusRowId: "row2",
      focusColumnId: "col2",
    });
  });

  expect(result.current.table.getCellSelectionRowIds()).toEqual([
    "row1",
    "row2",
  ]);
  expect(result.current.table.getCellSelectionColumnIds()).toEqual([
    "col1",
    "col2",
  ]);
  expect(result.current.table.getFocusedCell()).toMatchObject({
    row: { id: "row1" },
    column: { id: "col1" },
  });

  act(() => {
    result.current.table.moveCellSelection("right");
  });

  expect(result.current.table.getFocusedCell()).toMatchObject({
    row: { id: "row1" },
    column: { id: "col2" },
  });

  act(() => {
    result.current.table.resetCellSelection(true);
  });

  expect(result.current.table.getSelectedCellIds()).toEqual([]);
  expect(result.current.table.getFocusedCell()).toBeUndefined();
});
