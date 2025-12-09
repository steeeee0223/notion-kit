import type { Row } from "@tanstack/react-table";

import { Button } from "@notion-kit/shadcn";

import { GroupActions } from "../common";
import type { Row as RowModel } from "../lib/types";
import { BoardCard } from "./board-card";

interface BoardGroupProps {
  row: Row<RowModel>;
}

export function BoardGroup({ row }: BoardGroupProps) {
  const groupId = row.groupingColumnId;
  if (!groupId) {
    console.error(`No grouping column id found for the grouped row ${row.id}`);
    return null;
  }

  return (
    <div
      data-slot="board-group-header"
      data-block-id={row.id}
      className="group/board-group mb-4 box-content flex h-max w-[260px] shrink-0 flex-col items-center gap-2 rounded-lg bg-blue/20 p-2 text-sm"
    >
      <div className="flex w-full cursor-grab items-center">
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
    </div>
  );
}
