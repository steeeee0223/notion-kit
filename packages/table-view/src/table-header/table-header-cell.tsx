"use client";

import React, { useRef, useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { cn } from "@notion-kit/cn";
import { IconBlock } from "@notion-kit/icon-block";
import { Icon } from "@notion-kit/icons";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  TooltipPreset,
  VisuallyHidden,
} from "@notion-kit/shadcn";

import { DefaultIcon } from "../common";
import { PropMenu } from "../menus";
import { useTableViewCtx } from "../table-contexts";

interface TableHeaderCellProps {
  id: string;
  width: string;
  isResizing: boolean;
  onResizeStart: (e: React.MouseEvent | React.TouchEvent) => void;
  onResizeEnd: (e: React.MouseEvent | React.TouchEvent) => void;
}

/**
 * Table Header Cell
 *
 * @requires SortableContext
 */
export function TableHeaderCell({
  id,
  width,
  isResizing,
  onResizeStart,
  onResizeEnd,
}: TableHeaderCellProps) {
  const { properties } = useTableViewCtx();

  const property = properties[id]!;

  const [open, setOpen] = useState(false);
  const cellRef = useRef<HTMLDivElement>(null);
  const rect = cellRef.current?.getBoundingClientRect();

  /** DND */
  const {
    attributes,
    isDragging,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style: React.CSSProperties = {
    width,
    opacity: isDragging ? 0.8 : 1,
    zIndex: isDragging ? 10 : 0,
    transform: CSS.Translate.toString(transform), // translate instead of transform to avoid squishing
    transition, // Warning: it is somehow laggy
  };

  return (
    <div
      className="relative flex cursor-grab flex-row whitespace-nowrap"
      ref={setNodeRef}
      {...attributes}
      style={style}
    >
      <DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
        <div
          ref={cellRef}
          id="notion-table-view-header-cell"
          className="flex shrink-0 overflow-hidden p-0 text-sm"
          style={{ width }}
        >
          <DropdownMenuTrigger className="relative h-0">
            <VisuallyHidden />
          </DropdownMenuTrigger>
          <TooltipPreset
            description={
              property.description
                ? [
                    { type: "default", text: property.name },
                    { type: "secondary", text: property.description },
                  ]
                : property.name
            }
            side="top"
            className="z-[990]"
          >
            <Button
              ref={setActivatorNodeRef}
              tabIndex={0}
              variant="cell"
              className={cn("size-full px-2", isResizing && "bg-transparent")}
              {...listeners}
              onClick={() => setOpen((prev) => !prev)}
            >
              <div className="flex min-w-0 flex-auto items-center text-sm/[1.2]">
                <div className="mr-1 grid items-center justify-center">
                  <div className="col-start-1 row-start-1 opacity-100 transition-opacity duration-150">
                    {property.icon ? (
                      <IconBlock
                        icon={property.icon}
                        className="size-4 p-0 opacity-60 dark:opacity-45"
                      />
                    ) : (
                      <DefaultIcon
                        type={property.type}
                        className="fill-default/45"
                      />
                    )}
                  </div>
                </div>
                <div className="truncate">{property.name}</div>
                {property.description && (
                  <div className="inline-flex items-center">
                    <Icon.Info className="mt-px ml-1 block h-full w-3.5 shrink-0 fill-default/35" />
                  </div>
                )}
              </div>
            </Button>
          </TooltipPreset>
        </div>
        <DropdownMenuContent
          align="start"
          sideOffset={rect?.height}
          className="w-[220px]"
        >
          <PropMenu propId={id} />
        </DropdownMenuContent>
      </DropdownMenu>
      {/* Resize handle */}
      <div className="absolute right-0 z-10 w-0 grow-0">
        <div
          role="presentation"
          tabIndex={-1}
          className={cn(
            "-mt-px -ml-[3px] h-[34px] w-[5px] animate-bg-out cursor-col-resize bg-transparent hover:bg-blue/80",
            isResizing && "bg-blue/80",
          )}
          // Resize for desktop
          onMouseDown={onResizeStart}
          onMouseUp={onResizeEnd}
          // Resize for mobile
          onTouchStart={onResizeStart}
          onTouchEnd={onResizeEnd}
        />
      </div>
    </div>
  );
}
