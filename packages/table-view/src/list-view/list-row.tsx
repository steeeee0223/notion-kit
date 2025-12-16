import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { flexRender, type Row } from "@tanstack/react-table";

import { cn } from "@notion-kit/cn";
import { useIsMobile } from "@notion-kit/hooks";
import { buttonVariants } from "@notion-kit/shadcn";

import { RowActions } from "../common";
import type { Row as RowModel } from "../lib/types";
import { useTableViewCtx } from "../table-contexts";

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
    data: { type: "list-row", groupId: row.parentId },
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
      className="group/row my-1"
      style={style}
    >
      <div className="relative flex items-center">
        {!locked && (
          <RowActions
            className="absolute -left-12"
            rowId={row.id}
            isDragging={isDragging}
            isMobile={isMobile}
            dragHandleProps={{ ...attributes, ...listeners }}
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
        <div className="absolute -end-7 top-1/2 h-full w-7 -translate-y-1/2 cursor-pointer" />
      </div>
    </div>
  );
}
