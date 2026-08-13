import React from "react";
import { useDraggable } from "@dnd-kit/react";
import { format } from "date-fns";

import { cn } from "@notion-kit/cn";

import { composeRefs } from "@/primitives";

import { useTimelineRowContext } from "./timeline-row-context";

export interface TimelineRowResizeProps
  extends Omit<React.ComponentPropsWithRef<"div">, "children"> {
  direction: "start" | "end";
}

export function TimelineRowResize({
  ref: forwardedRef,
  direction,
  className,
  ...props
}: TimelineRowResizeProps) {
  const { meta, state } = useTimelineRowContext();
  const {
    handleRef,
    isDragging,
    ref: draggableRef,
  } = useDraggable({
    id: `timeline-item-resizer-${direction}-${meta.item.id}`,
    type: "timeline-item-resizer",
    data: { direction },
    disabled: !meta.movable,
    register: meta.movable,
  });
  if (!meta.movable) return null;
  const date = direction === "start" ? state.startAt : meta.resizeEndAt;

  return (
    <div
      {...props}
      data-slot="timeline-item-resizer"
      data-direction={direction}
      className={cn(
        "absolute top-0 z-10 h-full w-2 cursor-col-resize opacity-0 transition-opacity hover:opacity-100",
        direction === "start" ? "-inset-s-1.5" : "-inset-e-1.5",
        isDragging && "opacity-100",
        className,
      )}
      ref={composeRefs(draggableRef, handleRef, forwardedRef)}
    >
      <div
        className={cn(
          "absolute inset-y-1.5 w-1 rounded-sm bg-primary",
          direction === "start" ? "inset-s-1" : "inset-s-0",
        )}
      />
      <span
        className={cn(
          "pointer-events-none absolute h-9 w-50 text-xs/9",
          direction === "start" ? "inset-e-3 text-end" : "inset-s-3 text-start",
        )}
      >
        {format(date, "MMM dd, yyyy")}
      </span>
    </div>
  );
}
