"use client";

import React, { useCallback } from "react";
import { type DragEndEvent } from "@dnd-kit/core";
import type { Table } from "@tanstack/react-table";

import { BaseModal } from "@notion-kit/common/base-modal";
import { Icon } from "@notion-kit/icons";
import { useModal } from "@notion-kit/modal";
import { Button } from "@notion-kit/shadcn";

import { SortableDnd, useDndSensors } from "../common";
import type { Row } from "../lib/types";
import { useTableViewCtx } from "../table-contexts";
import { TableGroupedRow } from "./table-grouped-row";
import { TableRow } from "./table-row";

export function DndTableBody() {
  const { openModal } = useModal();
  const { table } = useTableViewCtx();
  const { locked } = table.getTableGlobalState();

  const handleRowDragEnd = useCallback(
    (e: DragEndEvent) => {
      const isSorted = table.getState().sorting.length > 0;
      if (!isSorted) return table.handleRowDragEnd(e);
      openModal(
        <BaseModal
          title="Would you like to remove sorting?"
          primary="Remove"
          secondary="Don't remove"
          onTrigger={() => {
            table.resetSorting();
            table.handleRowDragEnd(e);
          }}
        />,
      );
    },
    [openModal, table],
  );

  return (
    <>
      <div className="relative isolation-auto min-w-[708px]">
        {/* Drag and Fill handle */}
        <div
          id="notion-table-view-drag-and-fill-handle"
          className="relative z-(--z-row) flex"
        >
          <div className="flex w-[calc(100%-64px)]">
            {/* The blue circle */}
            {/* <div className="left-8">
            <div className="absolute left-[210px]">
              <div className="pointer-events-auto absolute left-0 top-[26px] h-[15px] w-[10px] cursor-ns-resize" />
              <div className="absolute left-0 top-7 size-[9px] transform cursor-ns-resize rounded-full border-2 border-blue/60 bg-main duration-200" />
            </div>
          </div> */}
          </div>
        </div>
        {/* ??? */}
        <div>
          <div
            data-block-id="15f35e0f-492c-8003-9976-f8ae747a6aeb"
            // key="notion-selectable notion-collection_view-block"
            className="flex w-full"
          />
        </div>
        {/* Rows */}
        <div className="relative">
          {table.getState().columnSizingInfo.isResizingColumn ? (
            <MemoizedTableBody table={table} onRowDragEnd={handleRowDragEnd} />
          ) : (
            <TableBody table={table} onRowDragEnd={handleRowDragEnd} />
          )}
        </div>
      </div>
      <div className="w-[438px]" />
      {!locked && (
        <Button
          id="notion-table-view-add-row"
          tabIndex={0}
          variant="cell"
          className="h-[33px] w-full bg-main pl-2 leading-5"
          onClick={() => table.addRow()}
        >
          <span className="sticky left-10 inline-flex items-center text-sm text-muted opacity-100 transition-opacity duration-200">
            <Icon.Plus className="mr-[7px] ml-px size-3.5 fill-default/35" />
            New page
          </span>
        </Button>
      )}
    </>
  );
}

interface TableBodyProps {
  table: Table<Row>;
  onRowDragEnd: (e: DragEndEvent) => void;
}

/**
 * un-memoized normal table body component - see memoized version below
 */
function TableBody({ table, onRowDragEnd }: TableBodyProps) {
  const sensors = useDndSensors();
  const rows = table.getRowModel().rows;

  return (
    <SortableDnd
      items={rows.map((row) => row.id)}
      sensors={sensors}
      onDragEnd={onRowDragEnd}
    >
      {rows.map((row) =>
        row.getIsGrouped() ? (
          <TableGroupedRow key={row.id} row={row} />
        ) : (
          <TableRow key={row.id} row={row} />
        ),
      )}
    </SortableDnd>
  );
}

/**
 * special memoized wrapper for our table body that we will use during column resizing
 */
export const MemoizedTableBody = React.memo<TableBodyProps>(
  TableBody,
  (prev, next) => prev.table.options.data === next.table.options.data,
);
