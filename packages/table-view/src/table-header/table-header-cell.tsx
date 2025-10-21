"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Header } from "@tanstack/react-table";

import { cn } from "@notion-kit/cn";
import { IconBlock } from "@notion-kit/icon-block";
import { Icon } from "@notion-kit/icons";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  TooltipPreset,
} from "@notion-kit/shadcn";

import { DefaultIcon } from "../common";
import type { Row } from "../lib/types";
import { PropMenu } from "../menus";

interface TableHeaderCellProps {
  header: Header<Row, unknown>;
}

/**
 * Table Header Cell
 *
 * @requires SortableContext
 */
export function TableHeaderCell({ header }: TableHeaderCellProps) {
  const info = header.column.getInfo();
  const isResizing = header.column.getIsResizing();
  const onResizeStart = header.getResizeHandler();

  /** DND */
  const {
    attributes,
    isDragging,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: header.column.id });

  const style: React.CSSProperties = {
    width: header.column.getWidth(),
    opacity: isDragging ? 0.8 : 1,
    zIndex: isDragging ? 10 : 0,
    transform: CSS.Translate.toString(transform), // translate instead of transform to avoid squishing
    transition, // Warning: it is somehow laggy
  };

  return (
    <div
      className="relative flex cursor-grab flex-row whitespace-nowrap"
      ref={setNodeRef}
      style={style}
    >
      <DropdownMenu modal={false}>
        <TooltipPreset
          description={
            info.description
              ? [
                  { type: "default", text: info.name },
                  { type: "secondary", text: info.description },
                ]
              : info.name
          }
          side="top"
          className="z-[990]"
        >
          <DropdownMenuTrigger asChild>
            <div
              id="notion-table-view-header-cell"
              className="flex shrink-0 overflow-hidden p-0 text-sm"
              style={{ width: header.column.getSize() }}
            >
              <Button
                {...attributes}
                {...listeners}
                variant="cell"
                className={cn("size-full px-2", isResizing && "bg-transparent")}
              >
                <div className="flex min-w-0 flex-auto items-center text-sm/[1.2]">
                  <div className="mr-1 grid items-center justify-center">
                    <div className="col-start-1 row-start-1 opacity-100 transition-opacity duration-150">
                      {info.icon ? (
                        <IconBlock
                          icon={info.icon}
                          className="size-4 p-0 opacity-60 dark:opacity-45"
                        />
                      ) : (
                        <DefaultIcon
                          type={info.type}
                          className="fill-default/45"
                        />
                      )}
                    </div>
                  </div>
                  <div className="truncate">{info.name}</div>
                  {info.description && (
                    <Icon.Info className="ml-1 size-3 fill-icon" />
                  )}
                </div>
              </Button>
            </div>
          </DropdownMenuTrigger>
        </TooltipPreset>
        <DropdownMenuContent
          align="start"
          sideOffset={0}
          className={cn("w-[220px]", isDragging && "hidden")}
        >
          <PropMenu propId={header.column.id} />
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
          onMouseUp={header.column.handleResizeEnd}
          // Resize for mobile
          onTouchStart={onResizeStart}
          onTouchEnd={header.column.handleResizeEnd}
        />
      </div>
    </div>
  );
}
