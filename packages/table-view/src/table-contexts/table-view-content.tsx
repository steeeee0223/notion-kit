"use client";

import { Icon } from "@notion-kit/icons";
import { Button, Separator } from "@notion-kit/shadcn";

import { DndTableBody } from "../table-body";
import { TableFooter } from "../table-footer";
import { TableHeader } from "../table-header";
import { SortSelector } from "../tools";
import { useTableViewCtx } from "./table-view-provider";

export function TableViewContent() {
  const { table } = useTableViewCtx();
  const { sorting } = table.getState();
  const isSorted = sorting.length > 0;

  return (
    <div
      role="table"
      id="notion-table-view"
      className="relative float-left min-w-full px-24 pb-0 lining-nums tabular-nums select-none"
    >
      <div className="absolute z-9990 w-full" />
      <div className="pointer-events-none mt-0 h-0" />
      {isSorted && (
        <div className="flex pt-1">
          <div className="relative grow-0 overflow-hidden">
            <div className="z-10 flex h-10 items-center overflow-x-hidden overflow-y-auto py-2">
              <SortSelector />
              <Separator orientation="vertical" className="mx-3" />
              {/* Filter button */}
              <Button
                tabIndex={0}
                variant="hint"
                size="xs"
                className="mr-3 gap-1 rounded-full px-2 text-sm"
              >
                <Icon.Plus className="size-3.5 fill-current" />
                Filter
              </Button>
            </div>
          </div>
        </div>
      )}
      <div
        data-block-id="15f35e0f-492c-8003-9976-f8ae747a6aeb"
        className="relative"
        style={table.getColumnSizeVariables()}
      >
        {/* Header row */}
        <TableHeader />
        {/* Table body */}
        <DndTableBody className="min-w-[708px]" />
        {/* Table footer */}
        <TableFooter />
      </div>
      <div className="pointer-events-none clear-both mt-0 h-0 translate-y-0" />
      <div className="absolute z-9990 w-full translate-y-[-34px]" />
    </div>
  );
}
