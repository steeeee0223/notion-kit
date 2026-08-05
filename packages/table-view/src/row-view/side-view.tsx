import React from "react";

import { cn } from "@notion-kit/cn";
import { Sheet, SheetContent, SheetTitle } from "@notion-kit/ui/primitives";

import { useTableViewCtx } from "@/table-contexts";

import { rowViewContentVariants } from "./utils";
import { ViewNav } from "./view-nav";
import { ViewProps } from "./view-props";

export function SideView({ children }: React.PropsWithChildren) {
  const { table } = useTableViewCtx();

  return (
    <table.Subscribe selector={(state) => state.tableGlobal}>
      {({ rowView, openedRowId }) => {
        const visibleRowId =
          openedRowId && table.getCoreRowModel().rowsById[openedRowId]
            ? openedRowId
            : null;
        const titleCell = visibleRowId
          ? table.getTitleCell(visibleRowId)
          : null;

        return (
          <Sheet
            open={!!visibleRowId && rowView === "side"}
            onOpenChange={() => table.openRow(null)}
          >
            <SheetContent
              hideClose
              id={visibleRowId ?? undefined}
              side="right"
              className="w-150 overflow-x-hidden overflow-y-auto sm:max-w-150"
            >
              {visibleRowId && (
                <>
                  <ViewNav rowId={visibleRowId} />
                  <div className={cn(rowViewContentVariants({ mode: "side" }))}>
                    <SheetTitle typography="h1" className="col-start-2 mb-2">
                      {titleCell?.cell.value}
                    </SheetTitle>
                    <div className="col-start-2 mb-3 min-w-0">
                      <ViewProps rowId={visibleRowId} />
                    </div>
                    <div className="col-start-2">{children}</div>
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
