import React from "react";
import { flexRender } from "@tanstack/react-table";

import { cn } from "@notion-kit/cn";
import { CountMethod } from "@notion-kit/table-hook";

import { useTableViewCtx } from "@/table-contexts";

export function TableFooter() {
  const { table } = useTableViewCtx();

  const startPinnedHeaders = table.getStartLeafHeaders();
  const headers = table.getCenterLeafHeaders();
  const isStartPinned = startPinnedHeaders.length > 0;
  const isSomeCountMethodSet = Object.values(
    table.store.state.columnCounting,
  ).some((v) => v.method !== CountMethod.NONE);

  return (
    <div className="group/footer left-0 z-(--z-row) box-border flex h-8 min-w-full border-t border-t-border-cell bg-main text-sm select-none">
      <div
        className={cn(
          "pr-8 opacity-0 transition-opacity",
          "group-hover/footer:opacity-100 group-has-data-[state=open]/footer:opacity-100",
          isSomeCountMethodSet && "opacity-100",
        )}
      >
        <div className={cn("m-0 inline-flex", isStartPinned && "flex")}>
          {/* Pinned Columns */}
          {isStartPinned && (
            <div className="sticky left-8 z-(--z-col) flex bg-main">
              {startPinnedHeaders.map((header) => (
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
