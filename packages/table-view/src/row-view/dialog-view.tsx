import React from "react";

import { cn } from "@notion-kit/cn";
import { Dialog, DialogContent, DialogTitle } from "@notion-kit/ui/primitives";

import { useTableViewMessages } from "@/messages";
import { useTableViewCtx } from "@/table-contexts";

import { rowViewContentVariants } from "./utils";
import { ViewNav } from "./view-nav";
import { ViewProps } from "./view-props";

export function DialogView({ children }: React.PropsWithChildren) {
  const { table, renderRowView } = useTableViewCtx();
  const messages = useTableViewMessages();

  return (
    <table.Subscribe selector={(state) => state.tableGlobal}>
      {({ openedRowId, rowView }) => {
        const row = openedRowId
          ? table.getCoreRowModel().rowsById[openedRowId]
          : undefined;
        const visibleRowId = row ? openedRowId : null;
        const title = visibleRowId
          ? table.getTitleCell(visibleRowId).cell.value
          : "";

        return (
          <Dialog
            open={!!visibleRowId && rowView === "center"}
            onOpenChange={() => table.openRow(null)}
          >
            <DialogContent
              hideClose
              id={visibleRowId ?? undefined}
              className="m-auto flex size-[calc(100%-144px)] flex-col overflow-hidden rounded-xl p-0"
            >
              {visibleRowId && row && (
                <>
                  <ViewNav rowId={visibleRowId} />
                  <div
                    className={cn(rowViewContentVariants({ mode: "center" }))}
                  >
                    <DialogTitle
                      typography="h1"
                      className="col-start-2 mb-2 text-left"
                    >
                      {title || messages.rowView.newPageTitle}
                    </DialogTitle>
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
            </DialogContent>
          </Dialog>
        );
      }}
    </table.Subscribe>
  );
}
