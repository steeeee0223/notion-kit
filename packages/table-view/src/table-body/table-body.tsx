import React, { useCallback, useState } from "react";
import type { DragEndEvent } from "@dnd-kit/react";

import { Icon } from "@notion-kit/icons";
import type { TableInstance } from "@notion-kit/table-hook";
import { AlertModal } from "@notion-kit/ui/alert-modal";
import { Button, Dialog, Sortable } from "@notion-kit/ui/primitives";

import { useTableViewCtx } from "@/table-contexts";

import { TableGroupedRow } from "./table-grouped-row";
import { TableRow } from "./table-row";

export function DndTableBody() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pendingDragEndEvent, setPendingDragEndEvent] =
    useState<DragEndEvent | null>(null);
  const { table } = useTableViewCtx();
  const { locked } = table.getTableGlobalState();

  const handleRowDragEnd = useCallback(
    (e: DragEndEvent) => {
      const isSorted = table.store.state.sorting.length > 0;
      if (!isSorted) return table.handleRowDragEnd(e);
      setPendingDragEndEvent(e);
      setDialogOpen(true);
    },
    [table],
  );

  const handleConfirmRemoveSorting = () => {
    if (pendingDragEndEvent) {
      table.resetSorting();
      table.handleRowDragEnd(pendingDragEndEvent);
      setPendingDragEndEvent(null);
    }
    setDialogOpen(false);
  };

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
          {table.store.state.columnResizing.isResizingColumn ? (
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
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertModal
          title="Would you like to remove sorting?"
          primary="Remove"
          secondary="Don't remove"
          onTrigger={handleConfirmRemoveSorting}
        />
      </Dialog>
    </>
  );
}

interface TableBodyProps {
  table: TableInstance;
  onRowDragEnd: (e: DragEndEvent) => void;
}

/**
 * un-memoized normal table body component - see memoized version below
 */
function TableBody({ table, onRowDragEnd }: TableBodyProps) {
  const rows = table.getRowModel().rows;

  return (
    <Sortable.Root onDragEnd={onRowDragEnd}>
      <Sortable.List>
        {rows.map((row) =>
          row.getIsGrouped() ? (
            <TableGroupedRow key={row.id} row={row} />
          ) : (
            <TableRow key={row.id} row={row} />
          ),
        )}
      </Sortable.List>
    </Sortable.Root>
  );
}

/**
 * special memoized wrapper for our table body that we will use during column resizing
 */
export const MemoizedTableBody = React.memo<TableBodyProps>(
  TableBody,
  (prev, next) => prev.table.options.data === next.table.options.data,
);
