import React from "react";
import { flexRender } from "@tanstack/react-table";

import { cn } from "@notion-kit/cn";
import type { RowInstance } from "@notion-kit/table-hook";
import { buttonVariants, Sortable } from "@notion-kit/ui/primitives";

import { Row, RowActionGroup } from "@/common";
import { useTableViewCtx } from "@/table-contexts";

interface ListRowProps {
  rowId: string;
}

export function ListRow({ rowId }: ListRowProps) {
  const { table } = useTableViewCtx();
  const row = table.getRow(rowId) as RowInstance;

  return (
    <table.Subscribe selector={(state) => state.tableGlobal.locked}>
      {(locked) => (
        <Sortable.Item
          id={row.id}
          index={row.index}
          group={row.parentId}
          disabled={locked}
          data={{ type: "list-row", groupId: row.parentId }}
          render={
            <Row.Root
              data-block-id={row.id}
              selected={row.getIsSelected()}
              className="my-1 w-full"
            />
          }
        >
          <Row.ActionPortal display={row.getIsSelected() ? "content" : "none"}>
            {!locked && <RowActionGroup row={row} />}
          </Row.ActionPortal>
          <Row.Content
            role="button"
            tabIndex={0}
            className={cn(
              buttonVariants({ variant: "cell" }),
              "relative h-7.5 w-full overflow-hidden rounded-md px-1 text-inherit opacity-100",
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
          </Row.Content>
          <div className="absolute -inset-e-7 top-1/2 h-full w-7 -translate-y-1/2 cursor-pointer" />
        </Sortable.Item>
      )}
    </table.Subscribe>
  );
}
