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
  const { locked } = table.getTableGlobalState();
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
  } = useSortable({ id: row.id, disabled: locked });
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
        className={cn(
          "flex w-full border-b border-b-border-cell",
          row.getIsFirstChild() && "border-t border-t-border-cell",
        )}
      >
        <div className="flex">
          <div className="sticky left-8 z-850 flex items-center bg-main">
            {!locked && (
              <>
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
                    <Button
                      variant="hint"
                      className="size-6"
                      onClick={addNextRow}
                    >
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
                      className="z-990 w-[265px]"
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
              </>
            )}
            {/* Left pinned columns */}
            <TableCells cells={row.getLeftVisibleCells()} />
          </div>
          {/* Center unpinned columns */}
          <TableCells cells={row.getCenterVisibleCells()} />
        </div>
      </div>
      {/* Bottom line at row end */}
      <div className="flex w-16 grow justify-start border-b border-b-border-cell" />
    </div>
  );
}

interface TableCellsProps {
  cells: Cell<RowModel, unknown>[];
}

function TableCells({ cells }: TableCellsProps) {
  return cells.map((cell) => {
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
