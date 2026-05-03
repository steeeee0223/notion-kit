import { useCallback } from "react";
import {
  DndContext,
  MouseSensor,
  useDraggable,
  useSensor,
} from "@dnd-kit/core";
import { restrictToHorizontalAxis } from "@dnd-kit/modifiers";
import { useMouse } from "@uidotdev/usehooks";
import { format } from "date-fns";

import { cn } from "@notion-kit/cn";

import {
  useTimelineContext,
  useTimelineDragging,
  useTimelineScrollX,
  useTimelineSidebarWidth,
} from "../timeline-provider";
import { getDateByMousePosition } from "../utils";

interface ResizerProps {
  id: string;
  direction: "left" | "right";
  ts: number | null;
}

function Resizer({ direction, id, ts }: ResizerProps) {
  const { isDragging, attributes, listeners, setNodeRef } = useDraggable({
    id: `timeline-item-resizer-${direction}-${id}`,
  });

  return (
    <div
      data-slot="timeline-item-resizer"
      className={cn(
        "absolute top-0 z-10 h-full w-2 cursor-col-resize opacity-0 transition-opacity hover:opacity-100",
        direction === "left" ? "-inset-s-1.5" : "-inset-e-1.5",
        isDragging && "opacity-100",
      )}
      ref={setNodeRef}
      {...attributes}
      {...listeners}
    >
      <div
        className={cn(
          "absolute top-1.5 bottom-1.5 w-1 rounded-sm bg-primary",
          direction === "left" ? "inset-s-1" : "inset-s-0",
        )}
      />
      {ts && (
        <span
          className={cn(
            "pointer-events-none absolute h-9 w-50 text-xs/9",
            direction === "left"
              ? "inset-e-3 text-end"
              : "inset-s-3 text-start",
          )}
        >
          {format(ts, "MMM dd, yyyy")}
        </span>
      )}
    </div>
  );
}

interface TimelineItemResizerProps extends ResizerProps {
  onDragMove?: (ts: Date) => void;
  onDragEnd?: () => void;
}

export function TimelineItemResizer({
  onDragMove,
  onDragEnd,
  ...props
}: TimelineItemResizerProps) {
  const timeline = useTimelineContext();
  const [scrollX] = useTimelineScrollX();
  const [, setDragging] = useTimelineDragging();
  const [sidebarWidth] = useTimelineSidebarWidth();

  const [mousePosition] = useMouse<HTMLDivElement>();
  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: { distance: 10 },
  });

  const handleDragMove = useCallback(() => {
    const timelineRect = timeline.ref?.current?.getBoundingClientRect();
    const x =
      mousePosition.x - (timelineRect?.left ?? 0) + scrollX - sidebarWidth;

    onDragMove?.(getDateByMousePosition(timeline, x));
  }, [mousePosition.x, onDragMove, scrollX, sidebarWidth, timeline]);

  const handleDragEnd = () => {
    setDragging(false);
    onDragEnd?.();
  };

  return (
    <DndContext
      modifiers={[restrictToHorizontalAxis]}
      onDragStart={() => setDragging(true)}
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
      sensors={[mouseSensor]}
    >
      <Resizer {...props} />
    </DndContext>
  );
}
