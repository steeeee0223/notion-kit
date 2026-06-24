import { useCallback, useRef } from "react";
import { RestrictToHorizontalAxis } from "@dnd-kit/abstract/modifiers";
import { PointerActivationConstraints, PointerSensor } from "@dnd-kit/dom";
import {
  DragDropProvider,
  useDraggable,
  type DragEndEvent,
} from "@dnd-kit/react";
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

const timelineResizerSensors: React.ComponentProps<
  typeof DragDropProvider
>["sensors"] = (defaults) => [
  ...defaults.filter((sensor) => sensor !== PointerSensor),
  PointerSensor.configure({
    activationConstraints: [
      new PointerActivationConstraints.Distance({ value: 10 }),
    ],
  }),
];

interface ResizerProps {
  id: string;
  direction: "left" | "right";
  ts: number | null;
}

function Resizer({ direction, id, ts }: ResizerProps) {
  const { isDragging, ref } = useDraggable({
    id: `timeline-item-resizer-${direction}-${id}`,
    type: "timeline-item-resizer",
  });

  return (
    <div
      data-slot="timeline-item-resizer"
      className={cn(
        "absolute top-0 z-10 h-full w-2 cursor-col-resize opacity-0 transition-opacity hover:opacity-100",
        direction === "left" ? "-inset-s-1.5" : "-inset-e-1.5",
        isDragging && "opacity-100",
      )}
      ref={ref}
    >
      <div
        className={cn(
          "absolute inset-y-1.5 w-1 rounded-sm bg-primary",
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
  const initialValueRef = useRef<Date | null>(null);

  const [mousePosition] = useMouse<HTMLDivElement>();

  const handleDragMove = useCallback(() => {
    const timelineRect = timeline.ref?.current?.getBoundingClientRect();
    const x =
      mousePosition.x - (timelineRect?.left ?? 0) + scrollX - sidebarWidth;

    onDragMove?.(getDateByMousePosition(timeline, x));
  }, [mousePosition.x, onDragMove, scrollX, sidebarWidth, timeline]);

  const handleDragStart = () => {
    initialValueRef.current = props.ts !== null ? new Date(props.ts) : null;
    setDragging(true);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setDragging(false);
    if (event.canceled) {
      if (initialValueRef.current) onDragMove?.(initialValueRef.current);
      initialValueRef.current = null;
      return;
    }
    initialValueRef.current = null;
    onDragEnd?.();
  };

  return (
    <DragDropProvider
      modifiers={[RestrictToHorizontalAxis]}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
      sensors={timelineResizerSensors}
    >
      <Resizer {...props} />
    </DragDropProvider>
  );
}
