"use client";

import { useCallback } from "react";
import { closestCenter, DndContext, type DragEndEvent } from "@dnd-kit/core";
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
import { Icon } from "@notion-kit/icons";
import { useModal } from "@notion-kit/modal";
import { Button } from "@notion-kit/shadcn";

import { useDndSensors } from "../common";
import type { Row } from "../lib/types";
import { TableGroupedRow } from "../table-body";
import { useTableViewCtx } from "../table-contexts";
import { ListRow } from "./list-row";

export function ListViewContent() {
  const { openModal } = useModal();
  const { table } = useTableViewCtx();
  const sensors = useDndSensors();

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
        <DndContext
          collisionDetection={closestCenter}
          modifiers={[restrictToVerticalAxis, restrictToParentElement]}
          onDragEnd={handleRowDragEnd}
          sensors={sensors}
        >
          <ListBody table={table} />
        </DndContext>
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

interface ListBodyProps {
  table: Table<Row>;
}

export function ListBody({ table }: ListBodyProps) {
  const rows = table.getRowModel().rows;
  return (
    <div className="relative flex flex-col">
      <SortableContext
        items={rows.map((row) => row.id)}
        strategy={verticalListSortingStrategy}
      >
        {rows.map((row) =>
          row.getIsGrouped() ? (
            <TableGroupedRow key={row.id} row={row} />
          ) : (
            <ListRow key={row.id} row={row} />
          ),
        )}
      </SortableContext>
    </div>
  );
}
