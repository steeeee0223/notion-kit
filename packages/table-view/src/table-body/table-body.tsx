"use client";

import React, { useCallback } from "react";
import { closestCenter, DndContext, DragEndEvent } from "@dnd-kit/core";
import {
  restrictToParentElement,
  restrictToVerticalAxis,
} from "@dnd-kit/modifiers";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import type { Table } from "@tanstack/react-table";

import { BaseModal } from "@notion-kit/common";
import { useModal } from "@notion-kit/modal";

import type { Row } from "../lib/types";
import { useTableViewCtx } from "../table-contexts";
import { TableRow } from "./table-row";

export function DndTableBody() {
  const { openModal } = useModal();
  const { table, sensors } = useTableViewCtx();

  const handleRowDragEnd = useCallback(
    (e: DragEndEvent) => {
      const isSorted = table.getState().sorting.length > 0;
      if (!isSorted) return table.handleRowDragEnd(e);
      openModal(
        <BaseModal
          title="Would you like to remove sorting?"
          primary="Remove"
          secondary="Don't remove"
          onTrigger={() => table.handleRowDragEnd(e)}
        />,
      );
    },
    [openModal, table],
  );

  return (
    <DndContext
      collisionDetection={closestCenter}
      modifiers={[restrictToVerticalAxis, restrictToParentElement]}
      onDragEnd={handleRowDragEnd}
      sensors={sensors}
    >
      <div className="relative">
        {table.getState().columnSizingInfo.isResizingColumn ? (
          <MemoizedTableBody table={table} />
        ) : (
          <TableBody table={table} />
        )}
      </div>
    </DndContext>
  );
}

interface TableBodyProps {
  table: Table<Row>;
}

/**
 * un-memoized normal table body component - see memoized version below
 */
function TableBody({ table }: TableBodyProps) {
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

  const rowOrder = table.getState().rowOrder;
  return (
    <SortableContext items={rowOrder} strategy={verticalListSortingStrategy}>
      {rowOrder.map((rowId) => (
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
