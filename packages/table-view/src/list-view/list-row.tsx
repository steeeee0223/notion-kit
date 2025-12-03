import React from "react";
import { flexRender, type Row } from "@tanstack/react-table";

import type { Row as RowModel } from "../lib/types";

interface ListRowProps {
  row: Row<RowModel>;
}

export function ListRow({ row }: ListRowProps) {
  return (
    <div data-block-id={row.id} className="my-1">
      <div className="relative flex">
        <a
          href={`#${row.id}`}
          rel="noopener noreferrer"
          className="relative flex h-7.5 grow animate-bg-in cursor-pointer items-center overflow-hidden rounded-md px-1 text-inherit no-underline opacity-100 select-none"
        >
          {/* TODO First cell */}
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
