import { useCallback, useState } from "react";
import type { DragEndEvent } from "@dnd-kit/react";
import type { SortingState } from "@tanstack/react-table";

import { Icon } from "@notion-kit/icons";
import { AlertModal } from "@notion-kit/ui/alert-modal";
import { Button, Dialog, Sortable } from "@notion-kit/ui/primitives";

import { BulkEditBar } from "@/common/bulk-edit/bulk-edit-bar";
import { TableGroupedRow } from "@/table-body";
import { useTableViewCtx } from "@/table-contexts";

import { ListRow } from "./list-row";

export function ListViewContent() {
  const [pendingDragEndEvent, setPendingDragEndEvent] =
    useState<DragEndEvent | null>(null);
  const { table } = useTableViewCtx();

  return (
    <table.Subscribe
      selector={(state) => ({
        sorting: state.sorting,
        grouping: state.grouping,
        groupingState: state.groupingState,
        expanded: state.expanded,
        columnOrder: state.columnOrder,
        columnVisibility: state.columnVisibility,
        columnsInfo: state.columnsInfo,
        locked: state.tableGlobal.locked,
      })}
    >
      {({ sorting, locked }) => (
        <ListViewContentInner
          sorting={sorting}
          locked={locked}
          pendingDragEndEvent={pendingDragEndEvent}
          setPendingDragEndEvent={setPendingDragEndEvent}
        />
      )}
    </table.Subscribe>
  );
}

interface ListViewContentInnerProps {
  sorting: SortingState;
  locked?: boolean;
  pendingDragEndEvent: DragEndEvent | null;
  setPendingDragEndEvent: (event: DragEndEvent | null) => void;
}

function ListViewContentInner({
  sorting,
  locked,
  pendingDragEndEvent,
  setPendingDragEndEvent,
}: ListViewContentInnerProps) {
  const { table } = useTableViewCtx();

  const rows = table.getRowModel().rows;

  const handleRowDragEnd = useCallback(
    (e: DragEndEvent) => {
      const isSorted = sorting.length > 0;
      if (!isSorted) return table.handleRowDragEnd(e);
      setPendingDragEndEvent(e);
    },
    [setPendingDragEndEvent, sorting.length, table],
  );

  const handleConfirmRemoveSorting = () => {
    if (pendingDragEndEvent) {
      table.resetSorting();
      table.handleRowDragEnd(pendingDragEndEvent);
    }
    setPendingDragEndEvent(null);
  };

  return (
    <div key="notion-list-view" className="min-w-177 px-24 pb-0">
      <BulkEditBar disabled={locked} />
      <table.Subscribe
        selector={(state) => ({
          locked: state.tableGlobal.locked,
          rowSelection: state.rowSelection,
        })}
      >
        {({ locked }) => (
          <div
            data-block-id="1fe35e0f-492c-80fd-8d7c-f7e953641770"
            className="flex flex-col py-1"
          >
            <Sortable.Root disabled={locked} onDragEnd={handleRowDragEnd}>
              <Sortable.List>
                {rows.map((row) =>
                  row.getIsGrouped() ? (
                    <TableGroupedRow key={row.id} row={row} />
                  ) : (
                    <ListRow key={row.id} rowId={row.id} />
                  ),
                )}
              </Sortable.List>
            </Sortable.Root>
            {!locked && (
              <Button
                tabIndex={0}
                variant="cell"
                className="h-7.5 rounded-md px-2 text-muted"
                onClick={() => table.addRow()}
              >
                <Icon.Plus className="size-3.5 fill-current" />
                New page
              </Button>
            )}
          </div>
        )}
      </table.Subscribe>
      <Dialog
        open={pendingDragEndEvent !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDragEndEvent(null);
        }}
      >
        <AlertModal
          title="Would you like to remove sorting?"
          primary="Remove"
          secondary="Don't remove"
          onTrigger={handleConfirmRemoveSorting}
        />
      </Dialog>
    </div>
  );
}
