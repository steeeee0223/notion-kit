import { useCallback } from "react";
import { useDraggable } from "@dnd-kit/react";

import { cn } from "@notion-kit/cn";

import { Button, type ButtonProps } from "@/primitives";

import { useTimelineRowContext } from "./timeline-row-context";

export type TimelineRowItemProps = Omit<
  ButtonProps,
  "render" | "size" | "variant"
>;

export function TimelineRowItem({
  ref,
  className,
  onClick,
  children,
  ...props
}: TimelineRowItemProps) {
  const { actions, meta } = useTimelineRowContext();
  const {
    handleRef,
    isDragging,
    ref: draggableRef,
  } = useDraggable({
    id: meta.item.id,
    type: "timeline-item",
    disabled: !meta.movable,
    register: meta.movable,
  });
  const itemRef = useCallback(
    (node: HTMLButtonElement | null) => {
      if (meta.movable) {
        draggableRef(node);
        handleRef(node);
      }
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    },
    [draggableRef, handleRef, meta.movable, ref],
  );
  return (
    <Button
      {...props}
      ref={itemRef}
      type="button"
      variant={null}
      data-slot="timeline-item-card"
      data-notion-slot="notion-timeline-item-properties"
      className={cn(
        "absolute inset-0 flex size-full min-w-0 justify-start overflow-hidden rounded-md px-1.5 text-start",
        meta.movable && "cursor-grab touch-none active:cursor-grabbing",
        isDragging && "cursor-grabbing",
        className,
      )}
      onClick={(event) => {
        if (!actions.consumeItemClick(event)) onClick?.(event);
      }}
    >
      {children}
    </Button>
  );
}
