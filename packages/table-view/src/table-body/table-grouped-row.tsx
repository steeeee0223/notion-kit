"use client";

import type { Row } from "@tanstack/react-table";

import { Icon } from "@notion-kit/icons";
import { Button } from "@notion-kit/shadcn";

import { GroupActions } from "../common";
import type { Row as RowModel } from "../lib/types";

interface TableGroupedRowProps {
  row: Row<RowModel>;
}

export function TableGroupedRow({ row }: TableGroupedRowProps) {
  const groupId = row.groupingColumnId;
  if (!groupId) {
    console.error(`No grouping column id found for the grouped row ${row.id}`);
    return null;
  }

  return (
    <div className="group/grouped-row h-11">
      <div className="flex h-full items-center overflow-hidden">
        {/* Expand button */}
        <Button
          tabIndex={0}
          variant="hint"
          className="size-6"
          aria-expanded={row.getIsExpanded()}
          aria-label={row.getIsExpanded() ? "Close" : "Open"}
          onPointerDown={row.getToggleExpandedHandler()}
        >
          <Icon.ArrowCaretFillSmall
            className="size-[0.8em] fill-menu-icon transition-[rotate]"
            side={row.getIsExpanded() ? "down" : "right"}
          />
        </Button>
        {/* Grouped value */}
        <div className="flex max-w-100 items-center overflow-hidden px-2 text-sm/6 font-medium whitespace-nowrap">
          {row.renderGroupingValue({})}
        </div>
        {/* Count */}
        {row.getShouldShowGroupAggregates() && (
          <Button variant="hint" size="xs" className="text-muted">
            {row.subRows.length}
          </Button>
        )}
        {/* Group actions */}
        <GroupActions
          className="opacity-0 group-hover/grouped-row:opacity-100"
          row={row}
        />
      </div>
    </div>
  );
}
