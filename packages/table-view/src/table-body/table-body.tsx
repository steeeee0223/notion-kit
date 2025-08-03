import React from "react";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import type { Table } from "@tanstack/react-table";

import type { Row } from "../lib/types";
import { TableRow } from "./table-row";

interface TableBodyProps {
  table: Table<Row>;
  dataOrder: string[];
}

/**
 * un-memoized normal table body component - see memoized version below
 */
export function TableBody({ table, dataOrder }: TableBodyProps) {
  const isSorted = table.getState().sorting.length > 0;
  if (isSorted) {
    const rows = table.getRowModel().rows;
    return (
      <SortableContext
        items={rows.map((row) => row.id)}
        strategy={verticalListSortingStrategy}
      >
        {rows.map((row) => (
          <TableRow key={row.id} row={row} />
        ))}
      </SortableContext>
    );
  }

  return (
    <SortableContext items={dataOrder} strategy={verticalListSortingStrategy}>
      {dataOrder.map((rowId) => (
        <TableRow key={rowId} row={table.getRow(rowId)} />
      ))}
    </SortableContext>
  );
}

/**
 * special memoized wrapper for our table body that we will use during column resizing
 */
export const MemoizedTableBody = React.memo<TableBodyProps>(
  TableBody,
  (prev, next) => prev.table.options.data === next.table.options.data,
);
