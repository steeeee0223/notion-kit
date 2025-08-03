"use client";

import React, { useRef } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { flexRender, Row } from "@tanstack/react-table";

import { cn } from "@notion-kit/cn";
import { useIsMobile } from "@notion-kit/hooks";
import { Icon } from "@notion-kit/icons";
import { Button, Checkbox, TooltipPreset, useMenu } from "@notion-kit/shadcn";

import type { Row as RowModel } from "../lib/types";
import { RowActionMenu } from "../menus";
import { useTableActions } from "../table-contexts";

interface TableRowProps {
  row: Row<RowModel>;
}

export function TableRow({ row }: TableRowProps) {
  const isMobile = useIsMobile();
  /** Add row */
  const { addRow } = useTableActions();
  const addNextRow = (e: React.MouseEvent) => {
    if (e.altKey) {
      addRow({ id: row.id, at: "prev" });
      return;
    }
    addRow({ id: row.id, at: "next" });
  };
  /** Open row menu */
  const dragHandleRef = useRef<HTMLButtonElement>(null);
  const { openMenu } = useMenu();
  const openActionMenu = () => {
    const rect = dragHandleRef.current?.getBoundingClientRect();
    openMenu(<RowActionMenu rowId={row.id} />, {
      x: rect?.right,
      y: (rect?.y ?? 0) - 40,
      className: "w-[265px]",
    });
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
                  <Icon.Plus className="size-3.5 fill-[#51493c]/30 dark:fill-default/30" />
                </Button>
              </TooltipPreset>
              <TooltipPreset
                description={[
                  { type: "default", text: "Drag to move" },
                  { type: "default", text: "Click to open menu" },
                ]}
                disabled={isDragging}
                className="z-999 text-center"
              >
                <Button
                  ref={dragHandleRef}
                  variant="hint"
                  className="h-6 w-4.5"
                  {...attributes}
                  {...listeners}
                  onClick={openActionMenu}
                >
                  <Icon.DragHandle className="size-3.5 fill-[#51493c]/30 dark:fill-default/30" />
                </Button>
              </TooltipPreset>
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
            {row.getLeftVisibleCells().map((cell) => (
              <React.Fragment key={cell.id}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </React.Fragment>
            ))}
          </div>
          {/* Center unpinned columns */}
          {row.getCenterVisibleCells().map((cell) => (
            <React.Fragment key={cell.id}>
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </React.Fragment>
          ))}
        </div>
      </div>
      {/* Bottom line at row end */}
      <div className="flex w-16 grow justify-start border-b border-b-border-cell" />
    </div>
  );
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
          // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
          (isMobile || isDragging) && "opacity-100",
        )}
        {...props}
      />
    </div>
  );
}
