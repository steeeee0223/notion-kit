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
import { useModal } from "@notion-kit/modal";

import { useDndSensors } from "../common";
import type { Row } from "../lib/types";
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
    <div key="notion-list-view" className="min-w-[708px] px-[194px] pb-0">
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
        <div
          role="button"
          tabIndex={0}
          className="flex h-7.5 animate-bg-in cursor-pointer items-center rounded-md px-1.5 text-sm text-(--c-texTer) select-none"
        >
          <svg
            aria-hidden="true"
            role="graphics-symbol"
            viewBox="0 0 16 16"
            key="plusSmall"
            className="mr-2 ml-0.5 block size-4 shrink-0 fill-(--c-icoTer) text-(--c-icoTer)"
          >
            <path d="M8 2.74a.66.66 0 0 1 .66.66v3.94h3.94a.66.66 0 0 1 0 1.32H8.66v3.94a.66.66 0 0 1-1.32 0V8.66H3.4a.66.66 0 0 1 0-1.32h3.94V3.4A.66.66 0 0 1 8 2.74"></path>
          </svg>
          New page
        </div>
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
        {rows.map((row) => (
          <ListRow key={row.id} row={row} />
        ))}
      </SortableContext>
    </div>
  );
}
