"use client";

import React from "react";
import { Cell, flexRender, Row } from "@tanstack/react-table";

import { cn } from "@notion-kit/cn";
import { useIsMobile } from "@notion-kit/hooks";
import { Checkbox, Sortable } from "@notion-kit/ui/primitives";

import { RowActions, TableRowActionGroup } from "../common";
import type { Row as RowModel } from "../lib/types";
import { useTableViewCtx } from "../table-contexts";

interface TableRowProps {
  index: number;
  row: Row<RowModel>;
}

export function TableRow({ index, row }: TableRowProps) {
  const isMobile = useIsMobile();
  /** Add row */
  const { table } = useTableViewCtx();
  const { locked } = table.getTableGlobalState();
  const addNextRow = (e: React.MouseEvent) => {
    if (e.altKey) {
      table.addRow({ id: row.id, at: "prev" });
      return;
    }
    table.addRow({ id: row.id, at: "next" });
  };
  return (
    <Sortable.Item
      id={row.id}
      index={index}
      disabled={locked}
      data={{ type: "table-row", groupId: row.parentId }}
      render={
        <div
          data-block-id={row.id}
          className="group/row flex h-[calc(100%+2px)]"
        />
      }
    >
      <div
        role="row"
        id="notion-table-view-row"
        dir="ltr"
        className={cn(
          "flex w-full border-b border-b-border-cell",
          row.getIsFirstChild() && "border-t border-t-border-cell",
        )}
      >
        <div className="flex">
          <div className="sticky left-8 z-(--z-row) flex items-center bg-main">
            {!locked && (
              <>
                {/* Row actions */}
                <RowActions
                  className="absolute -left-20"
                  rowId={row.id}
                  isMobile={isMobile}
                  onAddNext={addNextRow}
                />
                {/* Row selection */}
                <TableRowActionGroup
                  className="absolute -left-8 *:has-data-[state=checked]:opacity-100"
                  isMobile={isMobile}
                >
                  <label
                    htmlFor="row-select"
                    className="z-10 flex size-8 cursor-pointer items-center justify-center"
                  >
                    <Checkbox
                      id="row-select"
                      size="sm"
                      className="cursor-pointer rounded-[2px] accent-blue"
                    />
                  </label>
                </TableRowActionGroup>
              </>
            )}
            {/* Left pinned columns */}
            <TableCells cells={row.getLeftVisibleCells()} />
          </div>
          {/* Center unpinned columns */}
          <TableCells cells={row.getCenterVisibleCells()} />
        </div>
      </div>
      {/* Bottom line at row end */}
      <div className="flex w-16 grow justify-start border-b border-b-border-cell" />
    </Sortable.Item>
  );
}

interface TableCellsProps {
  cells: Cell<RowModel, unknown>[];
}

function TableCells({ cells }: TableCellsProps) {
  return cells.map((cell) => {
    return (
      <React.Fragment key={cell.id}>
        {flexRender(cell.column.columnDef.cell, cell.getContext())}
      </React.Fragment>
    );
  });
}
