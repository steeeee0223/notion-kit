"use client";

import React from "react";

import { cn } from "@notion-kit/cn";
import { Sheet, SheetContent, SheetTitle } from "@notion-kit/shadcn";

import { useTableViewCtx } from "../table-contexts";
import { rowViewContentVariants } from "./utils";
import { ViewNav } from "./view-nav";
import { ViewProps } from "./view-props";

export function SideView({ children }: React.PropsWithChildren) {
  const { table } = useTableViewCtx();
  const { rowView, openedRowId } = table.getTableGlobalState();
  const titleCell = openedRowId ? table.getTitleCell(openedRowId) : null;

  return (
    <Sheet
      open={!!openedRowId && rowView === "side"}
      onOpenChange={() => table.openRow(null)}
    >
      <SheetContent
        hideClose
        side="right"
        className="z-990 w-150 overflow-x-hidden overflow-y-auto sm:max-w-150"
      >
        <ViewNav />
        {openedRowId && (
          <div className={cn(rowViewContentVariants({ mode: "side" }))}>
            <SheetTitle typography="h1" className="col-start-2 mb-2">
              {titleCell?.cell.value}
            </SheetTitle>
            <div className="col-start-2 mb-3 min-w-0">
              <ViewProps rowId={openedRowId} />
            </div>
            <div className="col-start-2">{children}</div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
