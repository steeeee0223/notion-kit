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

export function deferColumnDragEnd(
  event: DragEndEvent,
  handler: ColumnDragEndHandler,
) {
  const { operation } = event;
  const source = operation.source;
  const target = operation.target;
  const eventSnapshot = {
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

  globalThis.setTimeout(() => handler(eventSnapshot), 0);
}

export const DndTableHeader = React.memo(function DndTableHeader() {
  const { table } = useTableViewCtx();
  const handleColumnDragEnd = React.useCallback(
    (event: DragEndEvent) =>
      deferColumnDragEnd(event, table.handleColumnDragEnd),
    [table],
  );

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
      })}
    >
      {({ tableGlobal }) => <TableHeaderRowContent tableGlobal={tableGlobal} />}
    </table.Subscribe>
  );
}

function TableHeaderRowContent({
  tableGlobal,
}: {
  tableGlobal: ReturnType<TableInstance["atoms"]["tableGlobal"]["get"]>;
}) {
  const { table } = useTableViewCtx();
  const isMobile = useIsMobile();

  const headers = table.getCenterLeafHeaders();
  const startPinnedHeaders = table.getStartLeafHeaders();
  const isStartPinned = startPinnedHeaders.length > 0;

  return (
    <div
      id="notion-table-view-header-row"
      dir="ltr"
      className="relative inset-x-0 box-border flex h-[34px] min-w-[708px] bg-main text-default/65 shadow-header-row"
    >
      <div className="sticky left-8 z-(--z-col) flex">
        {/* Hovered actions */}
        <div className="absolute -left-8">
          <div className="flex h-full justify-end border-b-border-cell bg-main">
            <label
              htmlFor="row-select"
              aria-label="row-select"
              className={cn(
                "z-10 flex size-8 cursor-pointer items-center justify-center opacity-0 hover:opacity-100 has-data-[state=checked]:opacity-100",
                isMobile && "opacity-100",
              )}
            >
              <Checkbox
                id="row-select"
                size="sm"
                className="cursor-pointer rounded-xs accent-blue"
              />
            </label>
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
