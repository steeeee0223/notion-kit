"use client";

import { useCallback, useState } from "react";
import type { DragEndEvent } from "@dnd-kit/react";

import { Icon } from "@notion-kit/icons";
import { AlertModal } from "@notion-kit/ui/alert-modal";
import { Button, Dialog, Sortable } from "@notion-kit/ui/primitives";

import { TableGroupedRow } from "../table-body";
import { useTableViewCtx } from "../table-contexts";
import { ListRow } from "./list-row";

export function ListViewContent() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pendingDragEndEvent, setPendingDragEndEvent] =
    useState<DragEndEvent | null>(null);
  const { table } = useTableViewCtx();

  const rows = table.getRowModel().rows;

  const handleRowDragEnd = useCallback(
    (e: DragEndEvent) => {
      const isSorted = table.getState().sorting.length > 0;
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
    <div key="notion-list-view" className="min-w-177 px-24 pb-0">
      <div
        data-block-id="1fe35e0f-492c-80fd-8d7c-f7e953641770"
        className="flex flex-col py-1"
      >
        <Sortable.Root onDragEnd={handleRowDragEnd}>
          <Sortable.List>
            {rows.map((row, index) =>
              row.getIsGrouped() ? (
                <TableGroupedRow key={row.id} row={row} />
              ) : (
                <ListRow key={row.id} row={row} index={index} />
              ),
            )}
          </Sortable.List>
        </Sortable.Root>
        <Button
          tabIndex={0}
          variant="cell"
          className="h-7.5 rounded-md px-2 text-muted"
          onClick={() => table.addRow()}
        >
          <Icon.Plus className="size-3.5 fill-current" />
          New page
        </Button>
      </div>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
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
