"use client";

import { useCallback } from "react";
import type { DragEndEvent } from "@dnd-kit/core";

import { BaseModal } from "@notion-kit/common/base-modal";
import { Icon } from "@notion-kit/icons";
import { useModal } from "@notion-kit/modal";
import { Button } from "@notion-kit/shadcn";

import { SortableDnd, useDndSensors } from "../common";
import { TableGroupedRow } from "../table-body";
import { useTableViewCtx } from "../table-contexts";
import { ListRow } from "./list-row";

export function ListViewContent() {
  const { openModal } = useModal();
  const { table } = useTableViewCtx();
  const sensors = useDndSensors();

  const rows = table.getRowModel().rows;

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
    <div key="notion-list-view" className="min-w-[708px] px-24 pb-0">
      <div
        data-block-id="1fe35e0f-492c-80fd-8d7c-f7e953641770"
        className="flex flex-col py-1"
      >
        <div className="relative flex flex-col">
          <SortableDnd
            items={rows.map((row) => row.id)}
            sensors={sensors}
            onDragEnd={handleRowDragEnd}
          >
            {rows.map((row) =>
              row.getIsGrouped() ? (
                <TableGroupedRow key={row.id} row={row} />
              ) : (
                <ListRow key={row.id} row={row} />
              ),
            )}
          </SortableDnd>
        </div>
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
    </div>
  );
}
