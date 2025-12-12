"use client";

import React from "react";
import { horizontalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Row } from "@tanstack/react-table";

import { Icon } from "@notion-kit/icons";
import { Button } from "@notion-kit/shadcn";

import { GroupActions } from "../common";
import type { Row as RowModel } from "../lib/types";
import { useTableViewCtx } from "../table-contexts";
import { BoardCard } from "./board-card";

interface BoardGroupProps {
  row: Row<RowModel>;
}

export function BoardGroup({ row }: BoardGroupProps) {
  const { table } = useTableViewCtx();
  const { locked } = table.getTableGlobalState();

  /** DND for group dragging */
  const {
    attributes,
    isDragging: isGroupDragging,
    listeners,
    setNodeRef: setGroupNodeRef,
    transform,
    transition,
  } = useSortable({
    id: row.id,
    disabled: locked,
    data: { type: "board-group" },
    strategy: horizontalListSortingStrategy,
  });

  const style: React.CSSProperties = {
    opacity: isGroupDragging ? 0.8 : 1,
    zIndex: isGroupDragging ? 10 : 0,
    transform: CSS.Translate.toString(transform), // translate instead of transform to avoid squishing
    transition, // Warning: it is somehow laggy
  };

  if (!row.groupingColumnId) {
    console.error(`No grouping column id found for the grouped row ${row.id}`);
    return null;
  }

  const addRow = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    table.addRowToGroup(row.id);
  };

  return (
    <div
      ref={setGroupNodeRef}
      data-slot="board-group"
      data-block-id={row.id}
      className="group/board-group mb-4 box-content flex h-max w-[260px] shrink-0 flex-col items-center gap-2 rounded-lg p-2 text-sm"
      style={style}
    >
      <div
        data-slot="board-group-header"
        className="flex w-full cursor-grab items-center"
        {...attributes}
        {...listeners}
      >
        {/* Grouping value */}
        <div className="flex max-w-100 items-center overflow-hidden text-sm/6 font-medium whitespace-nowrap">
          {row.renderGroupingValue({})}
        </div>
        {/* Count */}
        {row.getShouldShowGroupAggregates() && (
          <Button variant="hint" size="xs" className="text-muted">
            {row.subRows.length}
          </Button>
        )}
        {/*  Group actions */}
        <GroupActions
          className="ml-auto opacity-0 group-hover/board-group:opacity-100"
          row={row}
        />
      </div>
      <div
        data-slot="board-group-content"
        className="flex min-h-10 w-full flex-col gap-2"
      >
        {row.subRows.map((subRow) => (
          <BoardCard key={subRow.id} row={subRow} />
        ))}
      </div>
      <Button
        size="sm"
        className="w-full rounded-lg leading-tight text-secondary"
        onClick={addRow}
      >
        <Icon.Plus className="fill-current" />
        New page
      </Button>
    </div>
  );
}
