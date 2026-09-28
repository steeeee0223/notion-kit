import React from "react";

import { cn } from "@notion-kit/cn";
import { typography } from "@notion-kit/ui/primitives";

import { useTableViewMessages } from "@/messages";
import { useTableViewCtx } from "@/table-contexts";

import { rowViewContentVariants } from "./utils";
import { ViewNav } from "./view-nav";
import { ViewProps } from "./view-props";

export function FullView({ children }: React.PropsWithChildren) {
  const { table, renderRowView } = useTableViewCtx();
  const messages = useTableViewMessages();

  return (
    <table.Subscribe selector={(state) => state.tableGlobal}>
      {({ openedRowId, rowView }) => {
        if (!openedRowId || rowView !== "full") return null;
        const row = table.getCoreRowModel().rowsById[openedRowId];
        if (!row) return null;

        const titleCell = table.getTitleCell(openedRowId);
        const rowUrl = table.getRowUrl(openedRowId);

        if (rowUrl) return null;
        return (
          <section
            id={openedRowId}
            className="fixed inset-0 z-(--z-menu) overflow-y-auto bg-main"
          >
            <div className="sticky top-0 bg-main shadow-md">
              <ViewNav rowId={openedRowId} />
            </div>
            <div
              className={cn(
                rowViewContentVariants({ mode: "full", className: "mt-4" }),
              )}
            >
              <div
                className={cn(typography("h1"), "col-start-2 mb-2 text-left")}
              >
                {titleCell.cell.value || messages.rowView.newPageTitle}
              </div>
              <div className="col-start-2 mb-3 min-w-0">
                <ViewProps rowId={openedRowId} />
              </div>
              <div className="col-start-2">
                {renderRowView?.(row, table)}
                {children}
              </div>
            </div>
          </section>
        );
      }}
    </table.Subscribe>
  );
}
