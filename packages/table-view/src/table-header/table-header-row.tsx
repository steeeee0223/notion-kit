import React from "react";
import { flexRender } from "@tanstack/react-table";

import { cn } from "@notion-kit/cn";
import { useIsMobile } from "@notion-kit/hooks";
import { Icon } from "@notion-kit/icons";
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

import { TableViewMenuPage } from "@/features";
import { useTableViewCtx } from "@/table-contexts";

import { PropsMenu, TypesMenu } from "../menus";
import { TableHeaderActionCell } from "./table-header-action-cell";

export const DndTableHeader = React.memo(function DndTableHeader() {
  const { table } = useTableViewCtx();

  return (
    <Sortable.Root
      orientation="horizontal"
      onDragEnd={table.handleColumnDragEnd}
    >
      <div className="relative">
        <TableHeaderRow />
      </div>
    </Sortable.Root>
  );
});

function TableHeaderRow() {
  const { table } = useTableViewCtx();
  const isMobile = useIsMobile();

  const { tableGlobal } = table.getState();
  const headers = table.getCenterLeafHeaders();
  const leftPinnedHeaders = table.getLeftLeafHeaders();
  const isLeftPinned = leftPinnedHeaders.length > 0;

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
        className={cn("m-0 inline-flex", isLeftPinned && "flex")}
      >
        {/* Left pinned Columns */}
        {isLeftPinned && (
          <div
            id="draggable-ghost-section-left"
            className="sticky left-8 z-(--z-col) flex bg-main shadow-header-sticky"
          >
            {leftPinnedHeaders.map((header) => (
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
