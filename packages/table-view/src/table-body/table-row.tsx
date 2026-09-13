import React from "react";
import { flexRender } from "@tanstack/react-table";

import { cn } from "@notion-kit/cn";
import type { CellInstance, RowInstance } from "@notion-kit/table-hook";
import { Sortable } from "@notion-kit/ui/primitives";

import { Row, RowActionGroup } from "@/common";
import { useTableViewCtx } from "@/table-contexts";

interface TableRowProps {
  row: RowInstance;
}

export function TableRow({ row }: TableRowProps) {
  /** Add row */
  const { table } = useTableViewCtx();
  const { locked } = table.getTableGlobalState();
  const isSomeColumnPinned = table.atoms.columnPinning.get().start.length > 0;

  return (
    <Sortable.Item
      data-notion-slot="notion-table-view-row"
      id={row.id}
      index={row.index}
      group={row.parentId}
      disabled={locked}
      data={{ type: "table-row", groupId: row.parentId }}
      render={
        <Row.Root
          data-block-id={row.id}
          role="row"
          dir="ltr"
          selected={row.getIsSelected()}
          className={cn(
            "h-[calc(100%+2px)] border-b border-b-border-cell",
            row.getIsFirstChild() && "border-t border-t-border-cell",
          )}
        />
      }
    >
      <Row.ActionPortal
        display={
          row.getIsSelected()
            ? "content"
            : isSomeColumnPinned
              ? "portal"
              : "none"
        }
      >
        {!locked && <RowActionGroup row={row} />}
      </Row.ActionPortal>
      <Row.Content>
        <Row.StickyContent>
          <TableCells cells={row.getStartVisibleCells()} />
        </Row.StickyContent>
        <TableCells cells={row.getCenterVisibleCells()} />
      </Row.Content>
      {/* Keeps the row rule visible after the last rendered data cell. */}
      <div aria-hidden="true" className="min-w-16 grow" />
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
