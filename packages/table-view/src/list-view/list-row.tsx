import React from "react";
import { flexRender, type Row } from "@tanstack/react-table";

import { cn } from "@notion-kit/cn";
import { useIsMobile } from "@notion-kit/hooks";
import type { Row as RowModel } from "@notion-kit/table-hook";
import { buttonVariants, Sortable } from "@notion-kit/ui/primitives";

import { RowActions } from "@/common";
import { useTableViewCtx } from "@/table-contexts";

interface ListRowProps {
  row: Row<RowModel>;
}

export function ListRow({ row }: ListRowProps) {
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
      disabled={locked}
      data={{ type: "list-row", groupId: row.parentId }}
      render={<div data-block-id={row.id} className="group/row my-1" />}
    >
      <div className="relative flex items-center">
        {!locked && (
          <RowActions
            className="absolute -left-12"
            rowId={row.id}
            isMobile={isMobile}
            onAddNext={addNextRow}
          />
        )}
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
  );
}
