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
  } = useSortable({ id: row.id, disabled: locked });
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
        <a
          href={`#${row.id}`}
          rel="noopener noreferrer"
          className={cn(
            buttonVariants({ variant: "cell" }),
            "relative h-7.5 grow overflow-hidden rounded-md px-1 text-inherit no-underline opacity-100",
          )}
        >
          {/* TODO First cells, cells before Title cell are placed at left part (pinned left) */}
          <div className="relative m-0 flex min-h-7.5 min-w-30 flex-[1_1_auto] cursor-default items-center overflow-hidden rounded-sm py-0 pe-2 text-sm">
            <div className="contents">
              <div className="contents">{/* <!-- IconMenu button --> */}</div>
              {/* <!-- Title --> */}
              <div className="contents">
                <div
                  spellCheck="true"
                  aria-placeholder="New page"
                  contentEditable={false}
                  data-content-editable-leaf="true"
                  tabIndex={0}
                  role="textbox"
                  aria-label="Start typing to edit text"
                  className="pointer-events-none mr-1 inline w-auto max-w-full truncate text-sm/normal font-medium wrap-break-word caret-primary"
                >
                  a
                </div>
              </div>
            </div>
          </div>
          {row.getVisibleCells().map((cell) => (
            <React.Fragment key={cell.id}>
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </React.Fragment>
          ))}
        </a>
        <div className="absolute -end-7 top-1/2 h-full w-7 -translate-y-1/2 cursor-pointer" />
      </div>
    </div>
  );
}
