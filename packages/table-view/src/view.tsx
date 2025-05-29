"use client";

import React from "react";
import { closestCenter, DndContext } from "@dnd-kit/core";
import {
  restrictToHorizontalAxis,
  restrictToParentElement,
  restrictToVerticalAxis,
} from "@dnd-kit/modifiers";

import { Icon } from "@notion-kit/icons";
import { Button, MenuProvider } from "@notion-kit/shadcn";

import { MemoizedTableBody, TableBody } from "./table-body";
import {
  TableViewProvider,
  useTableActions,
  useTableViewCtx,
  type TableProps,
} from "./table-contexts";
import { TableFooter } from "./table-footer";
import { TableHeaderRow } from "./table-header";

export function TableView(props: TableProps) {
  return (
    <TableViewProvider {...props}>
      <MenuProvider>
        <TableViewContent />
      </MenuProvider>
    </TableViewProvider>
  );
}

export function TableViewContent() {
  const { table, columnSizeVars, columnSensors, rowSensors, dataOrder } =
    useTableViewCtx();
  const { reorder, addRow } = useTableActions();

  const leftPinnedHeaders = table.getLeftLeafHeaders();
  const headers = table.getCenterLeafHeaders();

  return (
    <div
      id="notion-table-view"
      className="relative float-left min-w-full px-24 pb-0 lining-nums tabular-nums select-none"
    >
      <div className="absolute z-[9990] w-full" />
      <div className="pointer-events-none mt-0 h-0" />
      <div
        data-block-id="15f35e0f-492c-8003-9976-f8ae747a6aeb"
        className="relative"
        style={columnSizeVars}
      >
        {/* Header row */}
        <div className="h-[34px]">
          <div className="w-full" style={{ overflowX: "initial" }}>
            <div className="w-[initial]">
              <div
                data-portal-container="e86cab6b-5fb8-4573-856b-6a12d191ce8c"
                data-is-sticky="false"
                data-sticky-attach-point="ceiling"
              >
                <DndContext
                  collisionDetection={closestCenter}
                  modifiers={[
                    restrictToHorizontalAxis,
                    restrictToParentElement,
                  ]}
                  onDragEnd={(e) => reorder(e, "col")}
                  sensors={columnSensors}
                >
                  <div className="relative">
                    {table.getHeaderGroups().map((headerGroup) => (
                      <TableHeaderRow
                        key={headerGroup.id}
                        leftPinnedHeaders={leftPinnedHeaders}
                        headers={headers}
                        columnOrder={table.getState().columnOrder}
                      />
                    ))}
                  </div>
                </DndContext>
              </div>
            </div>
          </div>
        </div>
        {/* Table body */}
        <div className="relative isolation-auto min-w-[708px]">
          {/* Drag and Fill handle */}
          <div
            id="notion-table-view-drag-and-fill-handle"
            className="relative z-[850] flex"
          >
            <div className="flex w-[calc(100%-64px)]">
              {/* The blue circle */}
              {/* <div className="left-8">
                <div className="absolute left-[210px]">
                  <div className="pointer-events-auto absolute left-0 top-[26px] h-[15px] w-[10px] cursor-ns-resize" />
                  <div className="absolute left-0 top-7 size-[9px] transform cursor-ns-resize rounded-full border-2 border-blue/60 bg-main duration-200" />
                </div>
              </div> */}
            </div>
          </div>
          {/* ??? */}
          <div>
            <div
              data-block-id="15f35e0f-492c-8003-9976-f8ae747a6aeb"
              // key="notion-selectable notion-collection_view-block"
              className="flex w-full"
            />
          </div>
          {/* Rows */}
          <DndContext
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis, restrictToParentElement]}
            onDragEnd={(e) => reorder(e, "row")}
            sensors={rowSensors}
          >
            <div className="relative">
              {table.getState().columnSizingInfo.isResizingColumn ? (
                <MemoizedTableBody table={table} dataOrder={dataOrder} />
              ) : (
                <TableBody table={table} dataOrder={dataOrder} />
              )}
            </div>
          </DndContext>
        </div>
        <div className="w-[438px]" />
        <Button
          id="notion-table-view-add-row"
          tabIndex={0}
          variant="cell"
          className="h-[33px] w-full bg-main pl-2 leading-5"
          onClick={() => addRow()}
        >
          <span className="sticky left-10 inline-flex items-center text-sm text-muted opacity-100 transition-opacity duration-200">
            <Icon.Plus className="mr-[7px] ml-px size-3.5 fill-default/35" />
            New page
          </span>
        </Button>
        {/* Table footer */}
        {table.getHeaderGroups().map((footerGroup) => (
          <TableFooter
            key={footerGroup.id}
            leftPinnedHeaders={leftPinnedHeaders}
            headers={headers}
          />
        ))}
      </div>
      <div className="pointer-events-none clear-both mt-0 h-0 translate-y-0" />
      <div className="absolute z-[9990] w-full translate-y-[-34px]" />
    </div>
  );
}
