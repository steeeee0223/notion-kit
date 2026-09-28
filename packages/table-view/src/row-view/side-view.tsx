import React from "react";

import { cn } from "@notion-kit/cn";
import { Sheet, SheetContent, SheetTitle } from "@notion-kit/ui/primitives";

import { useTableViewMessages } from "@/messages";
import { useTableViewCtx } from "@/table-contexts";

import { rowViewContentVariants } from "./utils";
import { ViewNav } from "./view-nav";
import { ViewProps } from "./view-props";

export function SideView({ children }: React.PropsWithChildren) {
  const { table, renderRowView } = useTableViewCtx();
  const messages = useTableViewMessages();

  return (
    <table.Subscribe selector={(state) => state.tableGlobal}>
      {({ rowView, openedRowId }) => {
        const row = openedRowId
          ? table.getCoreRowModel().rowsById[openedRowId]
          : undefined;
        const visibleRowId = row ? openedRowId : null;
        const title = visibleRowId
          ? table.getTitleCell(visibleRowId).cell.value
          : "";

        return (
          <Sheet
            open={!!visibleRowId && rowView === "side"}
            onOpenChange={() => table.openRow(null)}
          >
            <SheetContent
              hideClose
              id={visibleRowId ?? undefined}
              side="right"
              className="w-full overflow-x-hidden overflow-y-auto md:max-w-150"
            >
              {visibleRowId && row && (
                <>
                  <ViewNav rowId={visibleRowId} />
                  <div className={cn(rowViewContentVariants({ mode: "side" }))}>
                    <SheetTitle typography="h1" className="col-start-2 mb-2">
                      {title || messages.rowView.newPageTitle}
                    </SheetTitle>
                    <div className="col-start-2 mb-3 min-w-0">
                      <ViewProps rowId={visibleRowId} />
                    </div>
                    <div className="col-start-2">
                      {renderRowView?.(row, table)}
                      {children}
                    </div>
                  </div>
                </>
              )}
            </SheetContent>
          </Sheet>
        );
      }}
    </table.Subscribe>
  );
}
