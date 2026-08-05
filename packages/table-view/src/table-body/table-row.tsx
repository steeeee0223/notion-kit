import React from "react";
import { flexRender } from "@tanstack/react-table";

import { cn } from "@notion-kit/cn";
import { useIsMobile } from "@notion-kit/hooks";
import type { CellInstance, RowInstance } from "@notion-kit/table-hook";
import { Checkbox, Sortable } from "@notion-kit/ui/primitives";

import { RowActions, TableRowActionGroup } from "@/common";
import { useTableViewCtx } from "@/table-contexts";

interface TableRowProps {
  hasSelection: boolean;
  row: RowInstance;
}

export function TableRow({ hasSelection, row }: TableRowProps) {
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
                  hasSelection={hasSelection}
                  rowId={row.id}
                  isMobile={isMobile}
                  onAddNext={addNextRow}
                />
                {/* Row selection */}
                <TableRowActionGroup
                  className="absolute -left-8 *:has-data-[state=checked]:opacity-100"
                  hasSelection={hasSelection}
                  isMobile={isMobile}
                >
                  <Checkbox
                    id={`row-select-${row.id}`}
                    size="sm"
                    checked={row.getIsSelected()}
                    className="cursor-pointer rounded-xs accent-blue"
                    aria-label={`Select row ${row.id}`}
                    onClick={(event) => {
                      row.getToggleSelectedHandler()({
                        target: { checked: !row.getIsSelected() },
                        shiftKey: event.shiftKey,
                        nativeEvent: event,
                      });
                    }}
                  />
                </TableRowActionGroup>
              </>
            )}
            {/* Start pinned columns */}
            <TableCells cells={row.getStartVisibleCells()} />
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
