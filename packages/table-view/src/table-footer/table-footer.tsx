import React from "react";
import { flexRender, type Header } from "@tanstack/react-table";

import { cn } from "@notion-kit/cn";

import type { Row } from "../lib/types";
import { useTableViewCtx } from "../table-contexts";

interface TableFooterProps {
  leftPinnedHeaders: Header<Row, unknown>[];
  headers: Header<Row, unknown>[];
}

export function TableFooter({ leftPinnedHeaders, headers }: TableFooterProps) {
  const isLeftPinned = leftPinnedHeaders.length > 0;
  const { isSomeCountMethodSet } = useTableViewCtx();

  return (
    <div className="group/footer left-0 z-850 box-border flex h-8 min-w-full border-t border-t-border-cell bg-main text-sm select-none">
      <div
        className={cn(
          "pr-8 opacity-0 transition-opacity",
          "group-hover/footer:opacity-100 group-has-data-[state=open]/footer:opacity-100",
          isSomeCountMethodSet && "opacity-100",
        )}
      >
        <div className={cn("m-0 inline-flex", isLeftPinned && "flex")}>
          {/* Pinned Columns */}
          {isLeftPinned && (
            <div className="sticky left-8 z-830 flex bg-main">
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
