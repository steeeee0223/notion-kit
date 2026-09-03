import React from "react";
import { flexRender } from "@tanstack/react-table";

import { cn } from "@notion-kit/cn";
import { useIsMobile } from "@notion-kit/hooks";
import type { RowInstance } from "@notion-kit/table-hook";
import { buttonVariants, Sortable } from "@notion-kit/ui/primitives";

import { RowActionGroup } from "@/common";
import { useTableViewCtx } from "@/table-contexts";

interface ListRowProps {
  rowId: string;
}

export function ListRow({ rowId }: ListRowProps) {
  const isMobile = useIsMobile();
  const { table } = useTableViewCtx();
  const row = table.getRow(rowId) as RowInstance;
  const addNextRow = (e: React.MouseEvent) => {
    if (e.altKey) {
      table.addRow({ id: row.id, at: "prev" });
      return;
    }
    table.addRow({ id: row.id, at: "next" });
  };

  return (
    <table.Subscribe selector={(state) => state.tableGlobal.locked}>
      {(locked) => (
        <Sortable.Item
          id={row.id}
          index={row.index}
          group={row.parentId}
          disabled={locked}
          data={{ type: "list-row", groupId: row.parentId }}
          render={<div data-block-id={row.id} className="group/row my-1" />}
        >
          <div className="relative flex items-center">
            <div
              data-slot="list-row-action-gutter"
              className="sticky inset-s-0 z-(--z-row) flex w-(--table-view-row-action-gutter) shrink-0 items-center bg-main"
            >
              {!locked && (
                <RowActionGroup
                  className="w-full"
                  isMobile={isMobile}
                  row={row}
                  onAddNext={addNextRow}
                />
              )}
            </div>
            <div
              role="button"
              tabIndex={0}
              className={cn(
                buttonVariants({ variant: "cell" }),
                "relative h-7.5 grow overflow-hidden rounded-md px-1 text-inherit opacity-100",
              )}
              onClick={() => table.openRow(row.id)}
              onKeyDown={() => {
                // noop
              }}
            >
              {row.getVisibleCells().map((cell) => (
                <React.Fragment key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </React.Fragment>
              ))}
            </div>
            <div className="absolute -inset-e-7 top-1/2 h-full w-7 -translate-y-1/2 cursor-pointer" />
          </div>
        </Sortable.Item>
      )}
    </table.Subscribe>
  );
}
