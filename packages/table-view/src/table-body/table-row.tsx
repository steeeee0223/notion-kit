"use client";

import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Cell, flexRender, Row } from "@tanstack/react-table";

import { cn } from "@notion-kit/cn";
import { useIsMobile } from "@notion-kit/hooks";
import { Checkbox } from "@notion-kit/shadcn";

import { RowActions, TableRowActionGroup } from "../common";
import type { Row as RowModel } from "../lib/types";
import { useTableViewCtx } from "../table-contexts";

interface TableRowProps {
  row: Row<RowModel>;
}

export function TableRow({ row }: TableRowProps) {
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
  /** DND */
  const {
    attributes,
    isDragging,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({
    id: row.id,
    disabled: locked,
    data: {
      type: "table-row",
      groupId: row.parentId,
    },
  });
  const style: React.CSSProperties = {
    opacity: isDragging ? 0.8 : 1,
    transform: CSS.Translate.toString(transform), // translate instead of transform to avoid squishing
    transition, // Warning: it is somehow laggy
  };

  return (
    <div
      ref={setNodeRef}
      data-block-id={row.id}
      className="group/row flex h-[calc(100%+2px)]"
      style={style}
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
                  isDragging={isDragging}
                  isMobile={isMobile}
                  dragHandleProps={{ ...attributes, ...listeners }}
                  onAddNext={addNextRow}
                />
                {/* Row selection */}
                <TableRowActionGroup
                  className="absolute -left-8 *:has-data-[state=checked]:opacity-100"
                  isDragging={isDragging}
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
    </div>
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
