import React from "react";
import type { DragEndEvent } from "@dnd-kit/react";
import { flexRender } from "@tanstack/react-table";

import { cn } from "@notion-kit/cn";
import { useIsMobile } from "@notion-kit/hooks";
import { Icon } from "@notion-kit/icons";
import { TableViewMenuPage, type TableInstance } from "@notion-kit/table-hook";
import {
  Checkbox,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Sortable,
} from "@notion-kit/ui/primitives";

import { useTableViewCtx } from "@/table-contexts";

import { PropsMenu, TypesMenu } from "../menus";
import { TableHeaderActionCell } from "./table-header-action-cell";

type ColumnDragEndHandler = (event: DragEndEvent) => void;

function hasProjectedSelfTarget(event: DragEndEvent) {
  const { source, target } = event.operation;
  return (
    !event.canceled &&
    source?.id != null &&
    target?.id != null &&
    source.id === target.id &&
    "initialIndex" in source &&
    typeof source.initialIndex === "number" &&
    "index" in source &&
    typeof source.index === "number" &&
    source.initialIndex !== source.index
  );
}

function snapshotColumnDragEnd(event: DragEndEvent) {
  const { operation } = event;
  const source = operation.source;
  const target = operation.target;
  return {
    ...event,
    operation: {
      ...operation,
      source: source
        ? {
            id: source.id,
            initialIndex:
              "initialIndex" in source ? source.initialIndex : undefined,
            index: "index" in source ? source.index : undefined,
          }
        : null,
      target: target ? { id: target.id } : null,
      transform: { ...operation.transform },
    },
  } as DragEndEvent;
}

export function useColumnDragEnd(handler: ColumnDragEndHandler) {
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const cancelPending = React.useCallback(() => {
    if (timeoutRef.current === null) return;
    globalThis.clearTimeout(timeoutRef.current);
    timeoutRef.current = null;
  }, []);

  React.useLayoutEffect(() => cancelPending, [cancelPending, handler]);

  return React.useCallback(
    (event: DragEndEvent) => {
      cancelPending();
      if (!hasProjectedSelfTarget(event)) {
        handler(event);
        return;
      }

      const eventSnapshot = snapshotColumnDragEnd(event);
      timeoutRef.current = globalThis.setTimeout(() => {
        timeoutRef.current = null;
        handler(eventSnapshot);
      }, 0);
    },
    [cancelPending, handler],
  );
}

export const DndTableHeader = React.memo(function DndTableHeader() {
  const { table } = useTableViewCtx();
  const handleColumnDragEnd = useColumnDragEnd(table.handleColumnDragEnd);

  return (
    <Sortable.Root orientation="horizontal" onDragEnd={handleColumnDragEnd}>
      <div className="relative">
        <TableHeaderRow />
      </div>
    </Sortable.Root>
  );
});

function TableHeaderRow() {
  const { table } = useTableViewCtx();

  return (
    <table.Subscribe
      selector={(state) => ({
        tableGlobal: state.tableGlobal,
        columnOrder: state.columnOrder,
        columnVisibility: state.columnVisibility,
        columnPinning: state.columnPinning,
        columnSizing: state.columnSizing,
        columnResizing: state.columnResizing,
        columnsInfo: state.columnsInfo,
        rowSelection: state.rowSelection,
      })}
    >
      {({ rowSelection, tableGlobal }) => (
        <TableHeaderRowContent
          hasSelection={Object.keys(rowSelection).length > 0}
          tableGlobal={tableGlobal}
        />
      )}
    </table.Subscribe>
  );
}

function TableHeaderRowContent({
  hasSelection,
  tableGlobal,
}: {
  hasSelection: boolean;
  tableGlobal: ReturnType<TableInstance["atoms"]["tableGlobal"]["get"]>;
}) {
  const { table } = useTableViewCtx();
  const isMobile = useIsMobile();

  const headers = table.getCenterLeafHeaders();
  const startPinnedHeaders = table.getStartLeafHeaders();
  const isStartPinned = startPinnedHeaders.length > 0;
  const isAllRowsSelected = table.getIsAllRowsSelected();
  const isSomeRowsSelected = table.getIsSomeRowsSelected();

  return (
    <div
      id="notion-table-view-header-row"
      dir="ltr"
      className="group/header relative inset-x-0 box-border flex h-[34px] min-w-[708px] bg-main text-default/65 shadow-header-row"
    >
      <div className="sticky left-8 z-(--z-col) flex">
        {/* Hovered actions */}
        <div className="absolute -left-8">
          <div className="flex h-full justify-end border-b-border-cell bg-main">
            {!tableGlobal.locked && (
              <Checkbox
                id="select-all-rows"
                size="sm"
                checked={isAllRowsSelected}
                indeterminate={isSomeRowsSelected && !isAllRowsSelected}
                aria-label="Select all rows"
                className={cn(
                  "cursor-pointer rounded-xs accent-blue opacity-0 group-hover/header:opacity-100 hover:opacity-100 data-checked:opacity-100 data-indeterminate:opacity-100",
                  hasSelection && "opacity-100",
                  isMobile && "opacity-100",
                )}
                onCheckedChange={(checked) =>
                  table.toggleAllRowsSelected(checked)
                }
              />
            )}
          </div>
        </div>
      </div>
      <Sortable.List
        orientation="horizontal"
        className={cn("m-0 inline-flex", isStartPinned && "flex")}
      >
        {/* Start pinned Columns */}
        {isStartPinned && (
          <div
            id="draggable-ghost-section-left"
            className="sticky left-8 z-(--z-col) flex bg-main shadow-header-sticky"
          >
            {startPinnedHeaders.map((header) => (
              <React.Fragment key={header.id}>
                {flexRender(
                  header.column.columnDef.header,
                  header.getContext(),
                )}
              </React.Fragment>
            ))}
          </div>
        )}
        {/* Center unpinned Columns */}
        <div id="draggable-ghost-section-center" className="flex">
          {headers.map((header) => (
            <React.Fragment key={header.id}>
              {flexRender(header.column.columnDef.header, header.getContext())}
            </React.Fragment>
          ))}
        </div>
      </Sortable.List>
      {!tableGlobal.locked && (
        <Popover>
          <PopoverTrigger
            render={<TableHeaderActionCell icon={<Icon.Plus />} />}
          />
          <PopoverContent sideOffset={0} collisionPadding={12}>
            <TypesMenu menu={TableViewMenuPage.CreateProp} />
          </PopoverContent>
        </Popover>
      )}
      <DropdownMenu>
        <DropdownMenuTrigger
          render={<TableHeaderActionCell icon={<Icon.Dots />} />}
        />
        <DropdownMenuContent sideOffset={0} collisionPadding={12}>
          <PropsMenu />
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
