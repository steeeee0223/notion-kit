import React from "react";

import { cn } from "@notion-kit/cn";

function TableRoot({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "relative w-full min-w-0",
        "[--table-view-row-action-gutter:96px]",
        "[--table-view-pinned-start:var(--table-view-row-action-gutter)]",
        className,
      )}
      {...props}
    />
  );
}

function RowActionPortal({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="table-row-action-portal"
      className={cn(
        "sticky inset-s-(--table-view-row-action-gutter) z-(--z-row) w-0 -translate-x-(--table-view-row-action-gutter)",
        className,
      )}
      {...props}
    />
  );
}

function RowActionContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="table-row-action-content"
      className={cn(
        "flex h-full w-(--table-view-row-action-gutter) items-center justify-end bg-main pr-1.5 opacity-0 transition-opacity delay-0 duration-200",
        className,
      )}
      {...props}
    />
  );
}

export const Table = {
  Root: TableRoot,
};

export const Row = {
  ActionPortal: RowActionPortal,
  ActionContent: RowActionContent,
};
