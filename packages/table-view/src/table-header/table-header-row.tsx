"use client";

import React from "react";
import {
  horizontalListSortingStrategy,
  SortableContext,
} from "@dnd-kit/sortable";
import {
  flexRender,
  type ColumnOrderState,
  type Header,
} from "@tanstack/react-table";

import { cn } from "@notion-kit/cn";
import { useIsMobile } from "@notion-kit/hooks";
import { Icon } from "@notion-kit/icons";
import {
  Checkbox,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@notion-kit/shadcn";

import type { Row } from "../lib/types";
import { TableViewMenuPage } from "../lib/utils";
import { TableViewMenu, TypesMenu } from "../menus";
import { useTableViewCtx } from "../table-contexts";
import { TableHeaderActionCell } from "./table-header-action-cell";

interface TableHeaderRowProps {
  leftPinnedHeaders: Header<Row, unknown>[];
  headers: Header<Row, unknown>[];
  columnOrder: ColumnOrderState;
}

export function TableHeaderRow({
  leftPinnedHeaders,
  headers,
  columnOrder,
}: TableHeaderRowProps) {
  const { setTableMenu } = useTableViewCtx();
  const isMobile = useIsMobile();

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
              className="sticky left-8 z-[830] flex bg-main shadow-header-sticky"
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
      <Popover>
        <PopoverTrigger asChild>
          <TableHeaderActionCell icon={<Icon.Plus />} />
        </PopoverTrigger>
        <PopoverContent sideOffset={0} collisionPadding={12}>
          <TypesMenu menu={TableViewMenuPage.CreateProp} />
        </PopoverContent>
      </Popover>
      <Popover
        onOpenChange={(open) => {
          if (open) return;
          setTableMenu({ page: null });
        }}
      >
        <PopoverTrigger asChild>
          <TableHeaderActionCell icon={<Icon.Dots />} />
        </PopoverTrigger>
        <PopoverContent sideOffset={0} collisionPadding={12}>
          <TableViewMenu />
        </PopoverContent>
      </Popover>
    </div>
  );
}
