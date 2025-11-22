"use client";

import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Cell, flexRender, Row } from "@tanstack/react-table";

import { cn } from "@notion-kit/cn";
import { useIsMobile } from "@notion-kit/hooks";
import { Icon } from "@notion-kit/icons";
import {
  Button,
  Checkbox,
  Popover,
  PopoverContent,
  PopoverTrigger,
  TooltipPreset,
} from "@notion-kit/shadcn";

import type { Row as RowModel } from "../lib/types";
import { RowActionMenu } from "../menus";
import { useTableViewCtx } from "../table-contexts";

interface TableRowProps {
  row: Row<RowModel>;
}

export function TableRow({ row }: TableRowProps) {
  const isMobile = useIsMobile();
  /** Add row */
  const { table } = useTableViewCtx();
  const addNextRow = (e: React.MouseEvent) => {
    if (e.altKey) {
      table.addRow({ id: row.id, at: "prev" });
      return;
    }
    table.addRow({ id: row.id, at: "next" });
  };
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
    transform: CSS.Translate.toString(transform), // translate instead of transform to avoid squishing
    transition, // Warning: it is somehow laggy
  };

  return (
    <div
      ref={setNodeRef}
      data-block-id={row.id}
      className="group/row flex h-[calc(100%+2px)]"
      style={style}
    >
      <div
        id="notion-table-view-row"
        dir="ltr"
        className="flex w-full border-b border-b-border-cell"
      >
        <div className="flex">
          <div className="sticky left-8 z-850 flex items-center bg-main">
            {/* Row actions */}
            <TableRowActionGroup
              className="absolute -left-20"
              isDragging={isDragging}
              isMobile={isMobile}
            >
              <TooltipPreset
                description={[
                  { type: "default", text: "Click to add below" },
                  { type: "secondary", text: "Option-click to add above" },
                ]}
                className="z-999 text-center"
              >
                <Button variant="hint" className="size-6" onClick={addNextRow}>
                  <Icon.Plus className="size-3.5 fill-icon" />
                </Button>
              </TooltipPreset>
              <Popover>
                <TooltipPreset
                  description={[
                    { type: "default", text: "Drag to move" },
                    { type: "default", text: "Click to open menu" },
                  ]}
                  disabled={isDragging}
                  className="z-999 text-center"
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="hint"
                      className="h-6 w-4.5"
                      {...attributes}
                      {...listeners}
                    >
                      <Icon.DragHandle className="size-3.5 fill-icon" />
                    </Button>
                  </PopoverTrigger>
                </TooltipPreset>
                <PopoverContent
                  className="w-[265px]"
                  side="right"
                  align="start"
                >
                  <RowActionMenu rowId={row.id} />
                </PopoverContent>
              </Popover>
            </TableRowActionGroup>
            {/* Row selection */}
            <TableRowActionGroup
              className="absolute -left-8 *:has-data-[state=checked]:opacity-100"
              isDragging={isDragging}
              isMobile={isMobile}
            >
              <label
                htmlFor="row-select"
                className="z-10 flex size-8 cursor-pointer items-center justify-center"
              >
                <Checkbox
                  id="row-select"
                  size="sm"
                  className="cursor-pointer rounded-[2px] accent-blue"
                />
              </label>
            </TableRowActionGroup>
            {/* Left pinned columns */}
            <TableCells row={row} cells={row.getLeftVisibleCells()} />
          </div>
          {/* Center unpinned columns */}
          <TableCells row={row} cells={row.getCenterVisibleCells()} />
        </div>
      </div>
      {/* Bottom line at row end */}
      <div className="flex w-16 grow justify-start border-b border-b-border-cell" />
    </div>
  );
}

interface TableCellsProps {
  row: Row<RowModel>;
  cells: Cell<RowModel, unknown>[];
}

function TableCells({ row, cells }: TableCellsProps) {
  return cells.map((cell) => {
    if (cell.getIsGrouped()) {
      return (
        <div key={cell.id} className="relative flex h-full w-full">
          <div
            role="button"
            tabIndex={0}
            aria-expanded={row.getIsExpanded()}
            aria-label={row.getIsExpanded() ? "Close" : "Open"}
            className="relative flex size-6 animate-bg-in cursor-pointer items-center justify-center rounded-sm select-none"
            onPointerDown={row.getToggleExpandedHandler()}
          >
            <svg
              aria-hidden="true"
              role="graphics-symbol"
              viewBox="0 0 16 16"
              key="arrowCaretDownFillSmall"
              className={cn(
                "block size-[0.8em] shrink-0 transition-[rotate]",
                row.getIsExpanded() ? "rotate-0" : "-rotate-90",
              )}
            >
              <path d="M2.835 3.25a.8.8 0 0 0-.69 1.203l5.164 8.854a.8.8 0 0 0 1.382 0l5.165-8.854a.8.8 0 0 0-.691-1.203z" />
            </svg>
          </div>
          <div className="flex h-full overflow-x-clip">
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </div>
        </div>
      );
    }
    if (cell.getIsAggregated()) {
      // If the cell is aggregated, use the Aggregated renderer for cell
      return (
        <React.Fragment key={cell.id}>
          {flexRender(
            cell.column.columnDef.aggregatedCell ?? cell.column.columnDef.cell,
            cell.getContext(),
          )}
        </React.Fragment>
      );
    }

    // Otherwise, just render the regular cell
    return (
      <React.Fragment key={cell.id}>
        {flexRender(cell.column.columnDef.cell, cell.getContext())}
      </React.Fragment>
    );
  });
}

interface TableRowActionGroupProps extends React.ComponentProps<"div"> {
  isDragging?: boolean;
  isMobile?: boolean;
}

function TableRowActionGroup({
  className,
  isDragging,
  isMobile,
  ...props
}: TableRowActionGroupProps) {
  return (
    <div className={cn("bg-main", className)}>
      <div
        data-slot="table-row-action-group"
        className={cn(
          "flex h-full items-center opacity-0 transition-opacity delay-0 duration-200",
          "group-hover/row:opacity-100",
          "has-[button[aria-expanded='true']]:opacity-100",
          // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
          (isMobile || isDragging) && "opacity-100",
        )}
        {...props}
      />
    </div>
  );
}
