import React from "react";

import { cn } from "@notion-kit/cn";

function TableRoot({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("group/table-root relative w-full min-w-0", className)}
      {...props}
    />
  );
}
function TableContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "[--table-view-row-action-gutter:96px]",
        "px-(--table-view-row-action-gutter)",
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

interface RowActionPortalProps extends React.ComponentProps<"div"> {
  display?: "portal" | "content" | "none";
}
function RowActionPortal({
  className,
  display = "none",
  children,
  ...props
}: RowActionPortalProps) {
  return (
    <div
      data-slot="table-row-action-portal"
      data-display={display}
      className="group/row-action sticky inset-s-(--table-view-row-action-gutter) z-(--z-action-portal) w-0 -translate-x-(--table-view-row-action-gutter)"
      {...props}
    >
      <div
        className={cn(
          "flex h-full w-(--table-view-row-action-gutter) bg-main opacity-0 transition-opacity delay-0 duration-200",
          "max-md:opacity-100",
          "group-hover/row:opacity-100",
          "group-data-[display=portal]/row-action:opacity-100",
          "group-data-[display=content]/row-action:opacity-100",
          className,
        )}
      >
        {children}
      </div>
    </div>
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
        "max-md:opacity-100",
        "group-hover/row:opacity-100",
        "group-data-[display=content]/row-action:opacity-100",
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
        "sticky inset-s-(--table-view-row-action-gutter) z-(--z-row) flex items-center bg-main",
        className,
      )}
      {...props}
    />
  );
}

export const Table = {
  Root: TableRoot,
  Content: TableContent,
};

export const Row = {
  Root: RowRoot,
  ActionPortal: RowActionPortal,
  Content: RowContent,
  ActionContent: RowActionContent,
  StickyContent: RowStickyContent,
};
