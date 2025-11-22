"use client";

import { useMemo } from "react";

import { Icon } from "@notion-kit/icons";
import { Button, Separator } from "@notion-kit/shadcn";

import type { CellPlugin } from "./plugins";
import { DndTableBody } from "./table-body";
import {
  TableViewProvider,
  useTableViewCtx,
  type TableProps,
} from "./table-contexts";
import { TableFooter } from "./table-footer";
import { TableHeader } from "./table-header";
import { SortSelector } from "./tools";

export function TableView<TPlugins extends CellPlugin[] = CellPlugin[]>(
  props: TableProps<TPlugins>,
) {
  return (
    <TableViewProvider {...props}>
      <TableViewContent />
    </TableViewProvider>
  );
}

export function TableViewContent() {
  const { table } = useTableViewCtx();
  const { sorting, columnSizingInfo, columnSizing } = table.getState();
  const isSorted = sorting.length > 0;

  /**
   * Instead of calling `column.getSize()` on every render for every header
   * and especially every data cell (very expensive),
   * we will calculate all column sizes at once at the root table level in a useMemo
   * and pass the column sizes down as CSS variables to the <table> element.
   */
  const columnSizeVars = useMemo(
    () => {
      return table.getFlatHeaders().reduce<Record<string, number>>(
        (sizes, header) => ({
          ...sizes,
          [`--header-${header.id}-size`]: header.getSize(),
          [`--col-${header.column.id}-size`]: header.column.getSize(),
        }),
        {},
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      // eslint-disable-next-line react-hooks/exhaustive-deps
      table.getFlatHeaders(),
      columnSizingInfo,
      columnSizing,
    ],
  );

  return (
    <div
      id="notion-table-view"
      className="relative float-left min-w-full px-24 pb-0 lining-nums tabular-nums select-none"
    >
      <div className="absolute z-[9990] w-full" />
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
        style={columnSizeVars}
      >
        {/* Header row */}
        <TableHeader />
        {/* Table body */}
        <DndTableBody />
        {/* Table footer */}
        <TableFooter />
      </div>
      <div className="pointer-events-none clear-both mt-0 h-0 translate-y-0" />
      <div className="absolute z-[9990] w-full translate-y-[-34px]" />
    </div>
  );
}
