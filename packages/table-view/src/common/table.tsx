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

interface RowProps extends React.ComponentProps<"div"> {
  selected?: boolean;
}

/**
 * @example
 * Row.Root
 * ├─ Row.ActionPortal
 * │  └─ Row.ActionContent
 * └─ Row.Content
 *    └─ Row.StickyContent
 */
function RowRoot({ className, selected, ...props }: RowProps) {
  return (
    <div
      data-slot="table-row"
      data-selected={selected}
      className={cn(
        "group/row relative flex w-max min-w-full shrink-0",
        "[--z-action-portal:60]",
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
        "sticky inset-s-(--table-view-row-action-gutter) z-(--z-action-portal) w-0 -translate-x-(--table-view-row-action-gutter)",
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
        "group-hover/row:opacity-100",
        "group-data-[selected=true]/row:opacity-100",
        className,
      )}
      {...props}
    />
  );
}

function RowContent({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="table-row-content"
      className={cn("flex w-max shrink-0", className)}
      {...props}
    >
      {children}
      <div
        data-notion-slot="notion-selectable-halo"
        className="pointer-events-none absolute inset-s-0 z-(--z-row) size-full bg-blue/15 opacity-0 transition-opacity duration-200 ease-in-out group-data-[selected=true]/row:opacity-100"
      />
    </div>
  );
}

function RowStickyContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="table-row-sticky-content"
      className={cn(
        "sticky inset-s-(--table-view-pinned-start) z-(--z-row) flex items-center bg-main",
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
  Root: RowRoot,
  ActionPortal: RowActionPortal,
  Content: RowContent,
  ActionContent: RowActionContent,
  StickyContent: RowStickyContent,
};
