import { useLayoutEffect } from "react";

import type { CellInstance, TableInstance } from "@/table-contexts/types";

export function canSelectDataCell(cell: CellInstance) {
  return (
    cell.table.getTableGlobalState().layout === "table" &&
    !cell.row.getIsGrouped() &&
    cell.column.getIsVisible()
  );
}

/** Value edits retain focus; structural changes cannot revive stale endpoints. */
export function useCellSelectionDomain(table: TableInstance) {
  const reconcile = () => {
    const selection = table.atoms.cellSelection.get();
    if (!selection.length) return;
    const rows = new Set(
      table
        .getRowsInDisplayOrder()
        .filter((row) => !row.getIsGrouped())
        .map((row) => row.id),
    );
    const columns = new Set(
      table.getVisibleLeafColumns().map((column) => column.id),
    );
    const next =
      table.getTableGlobalState().layout !== "table"
        ? []
        : selection.filter(
            (range) =>
              rows.has(range.anchorRowId) &&
              rows.has(range.focusRowId) &&
              columns.has(range.anchorColumnId) &&
              columns.has(range.focusColumnId),
          );
    if (next.length !== selection.length) table.setCellSelection(next);
  };
  useLayoutEffect(reconcile);
  useLayoutEffect(() => {
    const subscriptions = [
      table.atoms.expanded,
      table.atoms.grouping,
      table.atoms.columnVisibility,
      table.atoms.globalFilter,
      table.atoms.columnFilters,
      table.atoms.tableGlobal,
      table.atoms.groupingState,
    ].map((atom) => atom.subscribe(reconcile));
    return () =>
      subscriptions.forEach((subscription) => subscription.unsubscribe());
  });
}
