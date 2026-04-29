"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { HeaderContext } from "@tanstack/react-table";

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
import type { ColumnInfo, Row } from "../lib/types";
import { PropMenu } from "../menus";

interface TableHeaderCellTriggerProps
  extends React.ComponentProps<typeof Button> {
  info: ColumnInfo;
  width?: string;
  hideMenu?: boolean;
}

function TableHeaderCellTrigger({
  info,
  width,
  hideMenu,
  className,
  ...props
}: TableHeaderCellTriggerProps) {
  return (
    <div
      data-slot="table-view-header-cell"
      className="flex shrink-0 overflow-hidden p-0 text-sm"
      style={{ width }}
    >
      <DropdownMenu>
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
        >
          <DropdownMenuTrigger asChild>
            <Button
              variant="cell"
              className={cn("size-full px-2", className)}
              {...props}
            >
              {info.icon ? (
                <IconBlock
                  icon={info.icon}
                  className="size-4 p-0 opacity-60 dark:opacity-45"
                />
              ) : (
                <DefaultIcon type={info.type} className="fill-default/45" />
              )}
              <div className="truncate">{info.name}</div>
              {info.description && <Icon.Info className="size-3 fill-icon" />}
            </Button>
          </DropdownMenuTrigger>
        </TooltipPreset>
        {!hideMenu && (
          <DropdownMenuContent
            align="start"
            sideOffset={0}
            className="w-[220px]"
          >
            <PropMenu view="table" propId={info.id} />
          </DropdownMenuContent>
        )}
      </DropdownMenu>
    </div>
  );
}

interface TableHeaderCellResizerProps extends React.ComponentProps<"div"> {
  isResizing?: boolean;
}

function TableHeaderCellResizer({
  isResizing,
  className,
  ...props
}: TableHeaderCellResizerProps) {
  return (
    <div
      dir="ltr"
      data-slot="table-view-header-cell-resizer"
      className="absolute inset-e-0 z-10 w-0 grow-0"
    >
      <div
        role="presentation"
        tabIndex={-1}
        className={cn(
          "-ms-[3px] -mt-px w-[5px] animate-bg-out cursor-col-resize bg-transparent hover:bg-blue/80",
          isResizing && "bg-blue/80",
          className,
        )}
        {...props}
      />
    </div>
  );
}

/**
 * Table Header Cell
 *
 * @requires SortableContext
 */
function TableHeaderCell({ header, table }: HeaderContext<Row, unknown>) {
  const info = header.column.getInfo();
  const isResizing = header.column.getIsResizing();
  const onResizeStart = header.getResizeHandler();
  const { locked } = table.getTableGlobalState();

  /** DND */
  const {
    attributes,
    isDragging,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: header.column.id, disabled: locked });

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
      <TableHeaderCellTrigger
        info={info}
        width={header.column.getWidth()}
        hideMenu={isDragging}
        className={cn(isResizing && "bg-transparent")}
        disabled={locked}
        {...attributes}
        {...listeners}
      />
      {/* Resize handle */}
      <TableHeaderCellResizer
        isResizing={isResizing}
        className="h-[34px]"
        // Resize for desktop
        onMouseDown={onResizeStart}
        onMouseUp={header.column.handleResizeEnd}
        // Resize for mobile
        onTouchStart={onResizeStart}
        onTouchEnd={header.column.handleResizeEnd}
      />
    </div>
  );
}

export { TableHeaderCell, TableHeaderCellTrigger, TableHeaderCellResizer };
