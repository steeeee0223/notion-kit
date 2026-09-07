import React from "react";
import { flexRender } from "@tanstack/react-table";

import { cn } from "@notion-kit/cn";
import { CountMethod } from "@notion-kit/table-hook";

import { Row } from "@/common";
import { useTableViewCtx } from "@/table-contexts";

export function TableFooter() {
  const { table } = useTableViewCtx();

  return (
    <table.Subscribe
      selector={(state) => ({
        columnCounting: state.columnCounting,
        columnOrder: state.columnOrder,
        columnVisibility: state.columnVisibility,
        columnPinning: state.columnPinning,
        columnSizing: state.columnSizing,
        columnResizing: state.columnResizing,
        columnsInfo: state.columnsInfo,
      })}
    >
      {({ columnCounting }) => {
        const startPinnedHeaders = table.getStartLeafHeaders();
        const headers = table.getCenterLeafHeaders();
        const isStartPinned = startPinnedHeaders.length > 0;
        const isSomeCountMethodSet = Object.values(columnCounting).some(
          (v) => (v.method as CountMethod) !== CountMethod.NONE,
        );

        return (
          <Row.Root
            pinned={isStartPinned}
            className="z-(--z-row) box-border h-8 border-t border-t-border-cell text-sm select-none"
          >
            <Row.ActionPortal>
              <Row.ActionContent />
            </Row.ActionPortal>
            <Row.Content
              className={cn(
                "pr-8",
                "group-hover/row:opacity-100 group-has-data-open/row:opacity-100",
                isSomeCountMethodSet && "opacity-100",
              )}
            >
              {/* Pinned Columns */}
              <Row.StickyContent className="z-(--z-col)">
                {startPinnedHeaders.map((header) => (
                  <React.Fragment key={header.id}>
                    {flexRender(
                      header.column.columnDef.footer,
                      header.getContext(),
                    )}
                  </React.Fragment>
                ))}
              </Row.StickyContent>
              {/* Unpinned Columns */}
              {headers.map((header) => (
                <React.Fragment key={header.id}>
                  {flexRender(
                    header.column.columnDef.footer,
                    header.getContext(),
                  )}
                </React.Fragment>
              ))}
            </Row.Content>
          </Row.Root>
        );
      }}
    </table.Subscribe>
  );
}
