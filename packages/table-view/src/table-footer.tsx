import React from "react";
import { flexRender, type Header } from "@tanstack/react-table";

import { cn } from "@notion-kit/cn";

import { RowDataType } from "./types";

import "./view.css";

interface TableFooterProps {
  leftPinnedHeaders: Header<RowDataType, unknown>[];
  headers: Header<RowDataType, unknown>[];
}

export function TableFooter({ leftPinnedHeaders, headers }: TableFooterProps) {
  const isLeftPinned = leftPinnedHeaders.length > 0;

  return (
    <div
      data-content-editable-void="true"
      className="--pseudoSelection--background: transparent; clip-path: polygon(0% -20%, 100% -20%, 100% 100%, 0% 100%); group/footer left-0 z-[850] box-border flex h-8 min-w-full border-t border-t-border-cell bg-main text-sm select-none"
    >
      <div className="hidden pr-8 group-hover/footer:flex">
        <div className={cn("m-0 inline-flex", isLeftPinned && "flex")}>
          {/* Pinned Columns */}
          {isLeftPinned && (
            <div className="shadow-header-sticky sticky left-8 z-[830] flex bg-main">
              {leftPinnedHeaders.map((header) => (
                <React.Fragment key={header.id}>
                  {flexRender(
                    header.column.columnDef.footer,
                    header.getContext(),
                  )}
                </React.Fragment>
              ))}
            </div>
          )}
          {/* Unpinned Columns */}
          <div className="flex">
            {headers.map((header) => (
              <React.Fragment key={header.id}>
                {flexRender(
                  header.column.columnDef.footer,
                  header.getContext(),
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
