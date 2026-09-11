import { useEffectEvent, useLayoutEffect } from "react";

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
  const reconcile = useEffectEvent(() => {
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
  });
  const { data, columns } = table.options;
  const { atoms } = table;
  useLayoutEffect(() => reconcile(), [data, columns]);
  useLayoutEffect(() => {
    const subscriptions = [
      atoms.expanded,
      atoms.grouping,
      atoms.columnVisibility,
      atoms.globalFilter,
      atoms.columnFilters,
      atoms.tableGlobal,
      atoms.groupingState,
      atoms.filterEvaluationTick,
    ].map((atom) => atom.subscribe(reconcile));
    return () =>
      subscriptions.forEach((subscription) => subscription.unsubscribe());
  }, [atoms]);
}
