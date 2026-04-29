import React from "react";

import { cn } from "@notion-kit/cn";

export function TimelineContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="timeline-content"
      className={cn(
        "relative grid min-h-max w-max flex-none",
        className,
      )}
      {...props}
    />
  );
}

export function TimelineListGroup({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="timeline-list-group"
      className={cn("pt-(--timeline-header-height)", className)}
      {...props}
    />
  );
}

export function TimelineList({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="timeline-list"
      className={cn(
        "z-0 min-h-full w-full pt-(--timeline-header-height) col-start-1 row-start-1",
        className,
      )}
      {...props}
    />
  );
}
