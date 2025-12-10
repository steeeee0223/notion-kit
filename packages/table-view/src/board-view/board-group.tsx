"use client";

import React from "react";
import { useSortable } from "@dnd-kit/sortable";
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

  /** DND */
  const {
    attributes,
    isDragging,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: row.id });
  const style: React.CSSProperties = {
    opacity: isDragging ? 0.8 : 1,
    zIndex: isDragging ? 10 : 0,
    transform: CSS.Translate.toString(transform), // translate instead of transform to avoid squishing
    transition, // Warning: it is somehow laggy
  };

  const groupId = row.groupingColumnId;
  if (!groupId) {
    console.error(`No grouping column id found for the grouped row ${row.id}`);
    return null;
  }

  const addRow = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    table.addRowToGroup({
      groupId,
      value: row.original.properties[groupId]!.value as unknown,
    });
  };

  return (
    <div
      ref={setNodeRef}
      data-slot="board-group"
      data-block-id={row.id}
      className="group/board-group mb-4 box-content flex h-max w-[260px] shrink-0 flex-col items-center gap-2 rounded-lg bg-blue/20 p-2 text-sm"
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
        className="flex w-full flex-col gap-2"
      >
        {row.subRows.map((row) => (
          <BoardCard key={row.id} row={row} />
        ))}
      </div>
      <Button
        size="sm"
        className="w-full leading-[1.2] text-secondary"
        onClick={addRow}
      >
        <Icon.Plus className="fill-current" />
        New page
      </Button>
    </div>
  );
}
