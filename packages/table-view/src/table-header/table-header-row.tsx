"use client";

import React from "react";
import { closestCenter, DndContext } from "@dnd-kit/core";
import {
  restrictToHorizontalAxis,
  restrictToParentElement,
} from "@dnd-kit/modifiers";
import {
  horizontalListSortingStrategy,
  SortableContext,
} from "@dnd-kit/sortable";
import { flexRender } from "@tanstack/react-table";

import { cn } from "@notion-kit/cn";
import { useIsMobile } from "@notion-kit/hooks";
import { Icon } from "@notion-kit/icons";
import {
  Checkbox,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@notion-kit/shadcn";

import { useDndSensors } from "../common";
import { TableViewMenuPage } from "../features";
import { PropsMenu, TypesMenu } from "../menus";
import { useTableViewCtx } from "../table-contexts";
import { TableHeaderActionCell } from "./table-header-action-cell";

export const DndTableHeader = React.memo(function DndTableHeader() {
  const { table } = useTableViewCtx();
  const sensors = useDndSensors();

  return (
    <DndContext
      collisionDetection={closestCenter}
      modifiers={[restrictToHorizontalAxis, restrictToParentElement]}
      onDragEnd={table.handleColumnDragEnd}
      sensors={sensors}
    >
      <div className="relative">
        <TableHeaderRow />
      </div>
    </DndContext>
  );
});

function TableHeaderRow() {
  const { table } = useTableViewCtx();
  const isMobile = useIsMobile();

  const { columnOrder, tableGlobal } = table.getState();
  const headers = table.getCenterLeafHeaders();
  const leftPinnedHeaders = table.getLeftLeafHeaders();
  const isLeftPinned = leftPinnedHeaders.length > 0;

  return (
    <div
      id="notion-table-view-header-row"
      dir="ltr"
      className="relative right-0 left-0 box-border flex h-[34px] min-w-[708px] bg-main text-default/65 shadow-header-row"
    >
      <div className="sticky left-8 z-830 flex">
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
                className="cursor-pointer rounded-[2px] accent-blue"
              />
            </label>
          </div>
        </div>
      </div>
      <div className={cn("m-0 inline-flex", isLeftPinned && "flex")}>
        <SortableContext
          items={columnOrder}
          strategy={horizontalListSortingStrategy}
        >
          {/* Left pinned Columns */}
          {isLeftPinned && (
            <div
              id="draggable-ghost-section-left"
              className="sticky left-8 z-830 flex bg-main shadow-header-sticky"
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
                {flexRender(
                  header.column.columnDef.header,
                  header.getContext(),
                )}
              </React.Fragment>
            ))}
          </div>
        </SortableContext>
      </div>
      {!tableGlobal.locked && (
        <Popover>
          <PopoverTrigger asChild>
            <TableHeaderActionCell icon={<Icon.Plus />} />
          </PopoverTrigger>
          <PopoverContent
            className="z-990"
            sideOffset={0}
            collisionPadding={12}
          >
            <TypesMenu menu={TableViewMenuPage.CreateProp} />
          </PopoverContent>
        </Popover>
      )}
      <Popover>
        <PopoverTrigger asChild>
          <TableHeaderActionCell icon={<Icon.Dots />} />
        </PopoverTrigger>
        <PopoverContent
          className="z-990"
          sideOffset={0}
          collisionPadding={12}
          sticky="always"
        >
          <PropsMenu />
        </PopoverContent>
      </Popover>
    </div>
  );
}
