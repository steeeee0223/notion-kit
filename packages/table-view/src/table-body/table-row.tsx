"use client";

import React, { useRef } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { flexRender, Row } from "@tanstack/react-table";

import { cn } from "@notion-kit/cn";
import { Icon } from "@notion-kit/icons";
import { Button, Checkbox, TooltipPreset } from "@notion-kit/shadcn";

import type { RowDataType } from "../lib/types";
import { RowActionMenu, useMenuControl } from "../menus";
import { useTableActions } from "../table-contexts";

interface TableRowProps {
  row: Row<RowDataType>;
}

export function TableRow({ row }: TableRowProps) {
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
  const { openPopover } = useMenuControl();
  const openActionMenu = () => {
    const rect = dragHandleRef.current?.getBoundingClientRect();
    openPopover(<RowActionMenu rowId={row.id} />, {
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
          {/* Left pinned columns */}
          <div className="sticky left-20 z-850 flex bg-main">
            {/* pinned: wrap another div (is this needed?) */}
            {/* div: flex opacity-100 duration-200 transition-opacity */}
            {/* Hovered actions */}
            <div className="absolute -left-20 bg-main">
              <div
                className={cn(
                  "flex h-full items-center opacity-0 transition-opacity delay-0 duration-200 group-hover/row:opacity-60 group-hover/row:hover:opacity-100",
                  isDragging && "opacity-100",
                )}
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
                <label
                  htmlFor="row-select"
                  className="z-10 flex h-full cursor-pointer items-start justify-center group-hover/row:opacity-60 group-hover/row:hover:opacity-100"
                >
                  <div className="flex h-[31px] w-8 items-center justify-center">
                    <Checkbox
                      id="row-select"
                      size="sm"
                      className="relative right-0.5 cursor-pointer rounded-[2px] accent-blue"
                    />
                  </div>
                </label>
              </div>
            </div>
            {/* TODO: pinned columns in the wrapped div */}
            {row.getLeftVisibleCells().map((cell) => (
              <React.Fragment key={cell.id}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </React.Fragment>
            ))}
          </div>
          {/* Center columns */}
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
