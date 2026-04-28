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
        "relative flex h-full w-max flex-none overflow-clip",
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
        "absolute top-(--timeline-header-height) z-0 h-full w-full overflow-y-auto",
        className,
      )}
      {...props}
    />
  );
}
