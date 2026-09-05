import React from "react";
import { flexRender } from "@tanstack/react-table";

import { cn } from "@notion-kit/cn";
import { useIsMobile } from "@notion-kit/hooks";
import type { CellInstance, RowInstance } from "@notion-kit/table-hook";
import { Sortable } from "@notion-kit/ui/primitives";

import { Row, RowActionGroup } from "@/common";
import { useTableViewCtx } from "@/table-contexts";

interface TableRowProps {
  row: RowInstance;
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
  return (
    <Sortable.Item
      id={row.id}
      index={row.index}
      group={row.parentId}
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
          "flex w-max min-w-full shrink-0 border-b border-b-border-cell",
          row.getIsFirstChild() && "border-t border-t-border-cell",
        )}
      >
        {/* Row actions */}
        <Row.ActionPortal>
          {!locked && (
            <RowActionGroup
              isMobile={isMobile}
              row={row}
              onAddNext={addNextRow}
            />
          )}
        </Row.ActionPortal>
        <div
          className={cn(
            "flex w-max shrink-0",
            row.getIsSelected() && "bg-blue/10",
          )}
        >
          <div className="sticky inset-s-(--table-view-row-action-gutter) z-(--z-row) flex items-center bg-main">
            {/* Start pinned columns */}
            <TableCells cells={row.getStartVisibleCells()} />
          </div>
          {/* Center unpinned columns */}
          <TableCells cells={row.getCenterVisibleCells()} />
        </div>
        {/* Keeps the row rule visible after the last rendered data cell. */}
        <div aria-hidden="true" className="min-w-16 grow" />
      </div>
    </Sortable.Item>
  );
}

interface TableCellsProps {
  cells: CellInstance[];
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
