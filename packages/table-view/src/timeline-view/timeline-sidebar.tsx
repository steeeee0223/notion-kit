"use client";

import { useCallback, useState } from "react";
import type { Row as TanstackRow } from "@tanstack/react-table";

import { Icon } from "@notion-kit/icons";
import { Popover, PopoverContent, PopoverTrigger } from "@notion-kit/shadcn";

import { SortableDnd } from "../common";
import type { Row } from "../lib/types";
import { RowActionMenu } from "../menus/row-action-menu";
import { useTableViewCtx } from "../table-contexts";

export function TimelineSidebar() {
  const { table } = useTableViewCtx();
  const { locked } = table.getTableGlobalState();
  const { sidebarWidth } = table.getTimelineState();
  const { grouping } = table.getState();
  const isGrouped = grouping.length > 0;

  const rows = isGrouped
    ? table.getGroupedRowModel().rows
    : table.getRowModel().rows;

  const rowIds = rows.flatMap((r) =>
    r.getIsGrouped() ? r.subRows.map((sr) => sr.id) : [r.id],
  );

  const handleDragEnd = useCallback(
    (e: import("@dnd-kit/core").DragEndEvent) => {
      table.handleRowDragEnd(e);
    },
    [table],
  );

  return (
    <div
      className="sticky start-0 top-0 z-[101] shrink-0 border-e border-[var(--ca-borSecTra)] bg-[var(--c-timBac)]"
      style={{ width: sidebarWidth }}
    >
      <div className="sticky top-0 z-10 flex h-[68px] items-end border-b border-[var(--ca-borSecTra)] px-2 pb-2">
        <button
          type="button"
          className="flex items-center gap-1 text-sm text-[var(--c-texSec)] hover:text-[var(--c-texPri)]"
          onClick={() => table.toggleSidebar()}
        >
          <Icon.ChevronRight className="size-4 rotate-180" />
        </button>
      </div>
      <SortableDnd
        items={rowIds}
        orientation="vertical"
        onDragEnd={handleDragEnd}
      >
        <div className="flex flex-col">
          {isGrouped
            ? rows.map((row) => <SidebarGroup key={row.id} row={row} />)
            : rows.map((row) => <SidebarRow key={row.id} row={row} />)}
        </div>
      </SortableDnd>
      {!locked && !isGrouped && (
        <button
          type="button"
          className="flex h-9 w-full items-center gap-1.5 px-2 text-sm text-[var(--c-texSec)] hover:bg-[var(--ca-bacSecTra)]"
          onClick={() => table.addRow()}
        >
          <Icon.Plus className="size-4 fill-current" />
          <span>New</span>
        </button>
      )}
    </div>
  );
}

interface SidebarGroupProps {
  row: TanstackRow<Row>;
}

function SidebarGroup({ row }: SidebarGroupProps) {
  const { table } = useTableViewCtx();
  const { locked } = table.getTableGlobalState();
  const { groupVisibility } = table.getState().groupingState;
  const isVisible = groupVisibility[row.id] ?? true;

  return (
    <div>
      <button
        type="button"
        className="flex h-9 w-full items-center gap-1.5 border-b border-[var(--ca-borSecTra)] px-2 text-sm font-medium"
        onClick={() => row.toggleGroupVisibility()}
      >
        <Icon.ChevronDown
          className={`size-3.5 transition-transform ${!isVisible ? "-rotate-90" : ""}`}
        />
        <span className="truncate">{row.renderGroupingValue({})}</span>
        <span className="text-[var(--c-texSec)]">{row.subRows.length}</span>
      </button>
      {isVisible &&
        row.subRows.map((subRow) => (
          <SidebarRow key={subRow.id} row={subRow} />
        ))}
      {isVisible && !locked && (
        <button
          type="button"
          className="flex h-9 w-full items-center gap-1.5 px-2 text-sm text-[var(--c-texSec)] hover:bg-[var(--ca-bacSecTra)]"
          onClick={() => table.addRowToGroup(row.id)}
        >
          <Icon.Plus className="size-4 fill-current" />
          <span>New</span>
        </button>
      )}
    </div>
  );
}

interface SidebarRowProps {
  row: TanstackRow<Row>;
}

function SidebarRow({ row }: SidebarRowProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const titleCell = row.getTitleCell();
  const titleValue = titleCell.cell.value as { title?: string };
  const displayTitle = titleValue.title ?? "Untitled";

  return (
    <Popover open={menuOpen} onOpenChange={setMenuOpen}>
      <PopoverTrigger asChild>
        <div
          className="flex h-9 w-full cursor-default items-center gap-1.5 px-2 text-sm hover:bg-[var(--ca-bacSecTra)]"
          onContextMenu={(e) => {
            e.preventDefault();
            setMenuOpen(true);
          }}
        >
          <span className="truncate">{displayTitle}</span>
        </div>
      </PopoverTrigger>
      <PopoverContent
        className="w-64"
        side="bottom"
        onClick={(e) => e.stopPropagation()}
      >
        <RowActionMenu rowId={row.id} />
      </PopoverContent>
    </Popover>
  );
}
