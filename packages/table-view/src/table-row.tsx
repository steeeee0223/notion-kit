/* eslint-disable jsx-a11y/label-has-associated-control */
import React from "react";
import { flexRender, Row } from "@tanstack/react-table";

import type { RowDataType } from "./types";

interface TableRowProps {
  row: Row<RowDataType>;
}

export const TableRow: React.FC<TableRowProps> = ({ row }) => {
  return (
    <div
      data-block-id={row.id}
      // key="notion-selectable notion-page-block notion-collection-item"
      className="group/row flex h-[calc(100%+2px)]"
    >
      <div
        id="notion-table-view-row"
        dir="ltr"
        className="flex w-full border-b border-b-border-cell"
      >
        <div className="flex">
          {/* Left pinned columns */}
          <div className="sticky left-8 z-[850] flex bg-main">
            {/* pinned: wrap another div (is this needed?) */}
            {/* div: flex opacity-100 transition-duration: 200ms; transition-timing-function: ease; transition-property: opacity; */}
            {/* Hover checkbox */}
            <div className="absolute -left-8 bg-main">
              <div className="ease h-full border-b-border-cell opacity-0 transition-opacity delay-0 duration-200 group-hover/row:opacity-60 group-hover/row:hover:opacity-100">
                <div className="h-full">
                  <label className="z-[10] flex h-full cursor-pointer items-start justify-center group-hover/row:opacity-60 group-hover/row:hover:opacity-100">
                    <div className="flex h-[31px] w-8 items-center justify-center">
                      <input
                        type="checkbox"
                        className="relative right-0.5 size-[14px] cursor-pointer accent-blue"
                      />
                    </div>
                  </label>
                </div>
              </div>
            </div>
            {/* TODO: pinned columns in the wrapped div */}
            {row.getLeftVisibleCells().map((cell) => (
              <React.Fragment key={cell.id}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </React.Fragment>
            ))}
          </div>
          {/* Center columns */}
          {row.getCenterVisibleCells().map((cell) => (
            <React.Fragment key={cell.id}>
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="flex w-[64px] grow justify-start border-b border-b-border-cell" />
    </div>
  );
};
