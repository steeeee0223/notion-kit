"use client";

import { CollisionPriority } from "@dnd-kit/abstract";
import { RestrictToHorizontalAxis } from "@dnd-kit/abstract/modifiers";
import { useDroppable } from "@dnd-kit/react";
import { useSortable } from "@dnd-kit/react/sortable";
import type { Row } from "@tanstack/react-table";

import { cn } from "@notion-kit/cn";
import { Icon } from "@notion-kit/icons";
import { Button } from "@notion-kit/ui/primitives";

import { GroupActions } from "../common";
import type { Row as RowModel } from "../lib/types";
import { useTableViewCtx } from "../table-contexts";
import { BoardCard } from "./board-card";

interface BoardGroupProps {
  index: number;
  itemIds: string[];
  row: Row<RowModel>;
}

export function BoardGroup({ index, itemIds, row }: BoardGroupProps) {
  const { table } = useTableViewCtx();
  const { locked } = table.getTableGlobalState();
  const {
    handleRef,
    isDragging,
    ref: sortableRef,
  } = useSortable({
    id: row.id,
    index,
    disabled: locked,
    type: "board-group",
    accept: "board-group",
    modifiers: [RestrictToHorizontalAxis],
  });
  const { isDropTarget, ref: listRef } = useDroppable({
    id: `board-list:${row.id}`,
    disabled: locked,
    type: "board-list",
    accept: "board-card",
    collisionPriority: CollisionPriority.Low,
    data: { groupId: row.id },
  });

  const addRow = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    table.addRowToGroup(row.id);
  };

  return (
    <div
      ref={sortableRef}
      data-slot="board-group"
      data-block-id={row.id}
      className={cn(
        "group/board-group mb-4 box-content flex h-max w-[260px] shrink-0 flex-col items-center gap-2 rounded-lg p-2 text-sm",
        isDragging && "z-10 bg-default/5 opacity-80",
      )}
    >
      <div
        ref={handleRef}
        data-slot="board-group-header"
        className="flex w-full cursor-grab items-center"
      >
        <div className="flex max-w-100 items-center overflow-hidden text-sm/6 font-medium whitespace-nowrap">
          {row.renderGroupingValue({})}
        </div>
        {row.getShouldShowGroupAggregates() && (
          <Button variant="hint" size="xs" className="text-muted">
            {itemIds.length}
          </Button>
        )}
        <GroupActions
          className="ml-auto opacity-0 group-hover/board-group:opacity-100"
          row={row}
        />
      </div>
      <div
        ref={listRef}
        data-slot="board-group-content"
        className={cn(
          "relative flex min-h-2 w-full flex-col gap-2",
          itemIds.length === 0 && "min-h-10",
        )}
      >
        {isDropTarget && itemIds.length === 0 && (
          <div className="absolute inset-x-0 top-0 h-1.5 bg-blue/30" />
        )}
        {itemIds.map((itemId, itemIndex) => (
          <BoardCardSlot
            key={itemId}
            itemId={itemId}
            groupId={row.id}
            index={itemIndex}
          />
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

function BoardCardSlot({
  groupId,
  index,
  itemId,
}: {
  groupId: string;
  index: number;
  itemId: string;
}) {
  const { table } = useTableViewCtx();
  const row = table.getRowModel().rowsById[itemId];
  if (!row) return null;

  return <BoardCard row={row} groupId={groupId} index={index} />;
}
