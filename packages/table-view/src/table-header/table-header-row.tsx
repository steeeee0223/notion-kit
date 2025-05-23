"use client";

import React, { useRef } from "react";
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
import { Checkbox, useMenu } from "@notion-kit/shadcn";

import type { RowDataType } from "../lib/types";
import { PropsMenu, TypesMenu } from "../menus";
import { TableHeaderActionCell } from "./table-header-action-cell";

interface TableHeaderRowProps {
  leftPinnedHeaders: Header<RowDataType, unknown>[];
  headers: Header<RowDataType, unknown>[];
  columnOrder: ColumnOrderState;
}

export const TableHeaderRow: React.FC<TableHeaderRowProps> = ({
  leftPinnedHeaders,
  headers,
  columnOrder,
}) => {
  const isMobile = useIsMobile();
  const { openMenu } = useMenu();

  const isLeftPinned = leftPinnedHeaders.length > 0;

  const plusButtonRef = useRef<HTMLButtonElement>(null);
  const openTypesMenu = () => {
    const rect = plusButtonRef.current?.getBoundingClientRect();
    openMenu(<TypesMenu propId={null} />, {
      x: rect?.left,
      y: rect ? rect.top + rect.height : 0,
    });
  };
  const openPropsMenu = () => openMenu(<PropsMenu />, { x: -12, y: -12 });

  return (
    <div
      id="notion-table-view-header-row"
      dir="ltr"
      className="relative right-0 left-0 box-border flex h-[34px] min-w-[708px] bg-main text-default/65 shadow-header-row"
      // TODO check if remove `z-870` causes any issue
    >
      <div className="sticky left-20 z-830 flex">
        <div className="absolute -left-20">
          <div className="flex h-full w-[74px] justify-end border-b-border-cell bg-main">
            <label
              htmlFor="row-select"
              aria-label="row-select"
              className={cn(
                "z-10 flex h-full cursor-pointer items-start justify-center opacity-0 hover:opacity-100 has-data-[state=checked]:opacity-100",
                isMobile && "opacity-100",
              )}
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
      </div>
      <div className={cn("m-0 inline-flex", isLeftPinned && "flex")}>
        <SortableContext
          items={columnOrder}
          strategy={horizontalListSortingStrategy}
        >
          {/* Pinned Columns */}
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
          {/* Unpinned Columns */}
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
      <TableHeaderActionCell
        ref={plusButtonRef}
        icon={<Icon.Plus />}
        onClick={openTypesMenu}
      />
      <TableHeaderActionCell icon={<Icon.Dots />} onClick={openPropsMenu} />
    </div>
  );
};
