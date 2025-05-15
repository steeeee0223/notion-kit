"use client";

import React, { useRef } from "react";

import "./view.css";

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
import { Icon } from "@notion-kit/icons";

import { PropsMenu, TypesMenu, useMenuControl } from "./menus";
import { ActionCell } from "./table-header-cells";
import type { RowDataType } from "./types";

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
  const { openPopover } = useMenuControl();

  const isLeftPinned = leftPinnedHeaders.length > 0;

  const plusButtonRef = useRef<HTMLDivElement>(null);
  const openTypesMenu = () => {
    const rect = plusButtonRef.current?.getBoundingClientRect();
    openPopover(<TypesMenu propId={null} />, {
      x: rect?.left,
      y: rect ? rect.top + rect.height : 0,
    });
  };
  const openPropsMenu = () => openPopover(<PropsMenu />, { x: -12, y: -12 });

  return (
    <div
      id="notion-table-view-header-row"
      dir="ltr"
      className="shadow-header-row dark:shadow-header-row-dark relative right-0 left-0 box-border flex h-[34px] min-w-[708px] bg-main text-default/65"
      // TODO check if remove `z-[870]` causes any issue
    >
      <div className="sticky left-8 z-[830] flex">
        <div className="absolute -left-8">
          <div className="h-full border-b-border-cell bg-main">
            <div className="h-full">
              <label
                htmlFor="row-select"
                aria-label="row-select"
                className="z-10 flex h-full cursor-pointer items-start justify-center opacity-0 hover:opacity-100"
              >
                <div className="flex h-[31px] w-8 items-center justify-center">
                  <input
                    id="row-select"
                    type="checkbox"
                    className="relative right-0.5 size-[14px] cursor-pointer accent-blue"
                  />
                </div>
              </label>
            </div>
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
              className="shadow-header-sticky dark:shadow-header-sticky-dark sticky left-8 z-[830] flex bg-main"
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
      <ActionCell
        ref={plusButtonRef}
        icon={
          <Icon.Plus className="block h-full w-3 shrink-0 fill-default/45" />
        }
        onClick={openTypesMenu}
      />
      <ActionCell
        icon={
          <Icon.Dots className="block h-full w-3 shrink-0 fill-default/45" />
        }
        onClick={openPropsMenu}
      />
    </div>
  );
};
