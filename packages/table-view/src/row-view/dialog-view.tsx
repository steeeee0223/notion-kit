"use client";

import React from "react";

import { cn } from "@notion-kit/cn";
import { Dialog, DialogContent, DialogTitle } from "@notion-kit/shadcn";

import { useTableViewCtx } from "../table-contexts";
import { rowViewContentVariants } from "./utils";
import { ViewNav } from "./view-nav";

export function DialogView({ children }: React.PropsWithChildren) {
  const { table } = useTableViewCtx();
  const { rowView, openedRowId } = table.getTableGlobalState();
  const titleCell = openedRowId ? table.getTitleCell(openedRowId) : null;

  return (
    <Dialog
      open={!!openedRowId && rowView === "center"}
      onOpenChange={() => table.openRow(null)}
    >
      <DialogContent
        hideClose
        className="z-990 m-auto flex h-[calc(100%-144px)] max-w-[calc(100%-144px)] flex-col overflow-hidden rounded-xl"
      >
        <ViewNav />
        {openedRowId && (
          <div className={cn(rowViewContentVariants({ mode: "center" }))}>
            <DialogTitle
              typography="h1"
              className="col-[content] mb-2 text-left"
            >
              {titleCell?.cell.value}
            </DialogTitle>
            {/* TODO display properties */}
            <div className="col-[content]">{children}</div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
