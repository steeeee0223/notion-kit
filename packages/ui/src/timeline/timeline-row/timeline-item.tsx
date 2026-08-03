import React, { useCallback, useMemo, useRef, useState } from "react";
import { RestrictToHorizontalAxis } from "@dnd-kit/abstract/modifiers";
import { PointerActivationConstraints, PointerSensor } from "@dnd-kit/dom";
import {
  DragDropProvider,
  useDraggable,
  type DragEndEvent,
} from "@dnd-kit/react";
import { useMouse } from "@uidotdev/usehooks";
import { addDays, differenceInCalendarDays, isSameDay } from "date-fns";

import { cn } from "@notion-kit/cn";
import { Icon } from "@notion-kit/icons";

import { Button } from "@/primitives";

import { useTimelineContext, useTimelineDragging } from "../timeline-provider";
import type { TimelineContextProps, TimelineFeature } from "../types";
import {
  addRangeFn,
  daysInFn,
  differenceInFn,
  getDateByMousePosition,
  getOffset,
  innerDifferenceInFn,
  resolveColumnWidth,
  snapDays,
  startOfFn,
} from "../utils";
import { TimelineItemResizer } from "./timeline-item-resizer";

const timelineItemSensors: React.ComponentProps<
  typeof DragDropProvider
>["sensors"] = (defaults) => [
  ...defaults.filter((sensor) => sensor !== PointerSensor),
  PointerSensor.configure({
    activationConstraints: [
      new PointerActivationConstraints.Distance({ value: 10 }),
    ],
  }),
];

function getWidth(
  startAt: number | Date,
  endAt: number | Date | null,
  ctx: TimelineContextProps,
) {
  const columnWidth = resolveColumnWidth(ctx.range, ctx.zoom);

  if (endAt === null) {
    return columnWidth * 2;
  }

  const differenceIn = differenceInFn[ctx.range];

  if (ctx.range === "daily") {
    const delta = differenceIn(endAt, startAt);

    return columnWidth * (delta ? delta : 1);
  }

  const startOf = startOfFn[ctx.range];
  const daysIn = daysInFn[ctx.range];

  const daysInStartRange = daysIn(startAt);
  const pixelsPerDayInStartRange = columnWidth / daysInStartRange;

  if (isSameDay(startAt, endAt)) {
    return pixelsPerDayInStartRange;
  }

  const innerDifferenceIn = innerDifferenceInFn[ctx.range];

  if (isSameDay(startOf(startAt), startOf(endAt))) {
    return (
      snapDays(innerDifferenceIn(endAt, startAt), ctx.range) *
      pixelsPerDayInStartRange
    );
  }

  const startRangeStart = startOf(startAt);
  const startRangeOffset = snapDays(
    daysInStartRange - differenceInCalendarDays(startAt, startRangeStart),
    ctx.range,
  );
  const endRangeStart = startOf(endAt);
  const endRangeOffset = snapDays(
    differenceInCalendarDays(endAt, endRangeStart),
    ctx.range,
  );
  const fullRangeOffset = differenceIn(endRangeStart, startRangeStart);
  const daysInEndRange = daysIn(endAt);
  const pixelsPerDayInEndRange = columnWidth / daysInEndRange;

  return (
    (fullRangeOffset - 1) * columnWidth +
    startRangeOffset * pixelsPerDayInStartRange +
    endRangeOffset * pixelsPerDayInEndRange
  );
}

export interface TimelineItemProps {
  item: TimelineFeature;
  className?: string;
  onMove?: (id: string, start: number, end: number | null) => void;
  render?: () => React.ReactNode;
}

export function TimelineItem({
  item,
  className,
  onMove,
  render,
}: TimelineItemProps) {
  const timeline = useTimelineContext();
  const sourceStartAt = useMemo(() => new Date(item.startAt), [item.startAt]);
  const sourceEndAt = useMemo(
    () => (item.endAt === null ? null : new Date(item.endAt)),
    [item.endAt],
  );
  const [draftStartAt, setDraftStartAt] = useState(sourceStartAt);
  const [draftEndAt, setDraftEndAt] = useState(sourceEndAt);
  const [gestureActive, setGestureActive] = useState(false);
  const startAt = gestureActive ? draftStartAt : sourceStartAt;
  const endAt = gestureActive ? draftEndAt : sourceEndAt;

  const width = useMemo(
    () => getWidth(startAt, endAt, timeline),
    [startAt, endAt, timeline],
  );
  const offset = useMemo(
    () => getOffset(startAt, timeline),
    [startAt, timeline],
  );

  const addRange = useMemo(() => addRangeFn[timeline.range], [timeline.range]);
  const [, setDragging] = useTimelineDragging();

  const [mousePosition] = useMouse<HTMLDivElement>();

  const dragOriginRef = useRef<{
    mouseX: number;
    startAt: Date;
    endAt: Date | null;
  } | null>(null);

  const beginGesture = () => {
    setDraftStartAt(sourceStartAt);
    setDraftEndAt(sourceEndAt);
    setGestureActive(true);
  };

  const handleItemDragStart = () => {
    beginGesture();
    setDragging(true);
    dragOriginRef.current = {
      mouseX: mousePosition.x,
      startAt: sourceStartAt,
      endAt: sourceEndAt,
    };
  };

  const handleItemDragMove = useCallback(() => {
    const origin = dragOriginRef.current;
    if (!origin) return;
    const currentDate = getDateByMousePosition(timeline, mousePosition.x);
    const originalDate = getDateByMousePosition(timeline, origin.mouseX);
    const delta =
      timeline.range === "daily"
        ? differenceInFn[timeline.range](currentDate, originalDate)
        : innerDifferenceInFn[timeline.range](currentDate, originalDate);
    const newStartDate = addDays(origin.startAt, delta);
    const newEndDate =
      origin.endAt === null ? null : addDays(origin.endAt, delta);

    setDraftStartAt(newStartDate);
    setDraftEndAt(newEndDate);
  }, [timeline, mousePosition.x]);

  const handleDragEnd = (event?: DragEndEvent) => {
    setDragging(false);
    dragOriginRef.current = null;
    setGestureActive(false);
    if (event?.canceled) {
      return;
    }
    onMove?.(item.id, draftStartAt.getTime(), draftEndAt?.getTime() ?? null);
  };

  return (
    <div
      data-slot="timeline-item"
      className={cn(
        "isolation-auto flex h-(--timeline-row-height) w-full cursor-default",
        className,
      )}
    >
      <div
        data-slot="notion-timeline-item"
        className="absolute z-(--timeline-item-z) my-px flex h-[34px] rounded-md bg-popover shadow-out-md"
        style={{
          width: Math.round(width),
          insetInlineStart: Math.round(offset),
        }}
      >
        {/* Left resizer */}
        {onMove && (
          <TimelineItemResizer
            direction="left"
            id={item.id}
            ts={startAt.getTime()}
            onDragStart={beginGesture}
            onDragMove={setDraftStartAt}
            onDragEnd={handleDragEnd}
            onDragCancel={() => setGestureActive(false)}
          />
        )}
        {/* Item card */}
        {onMove ? (
          <DragDropProvider
            modifiers={[RestrictToHorizontalAxis]}
            onDragStart={handleItemDragStart}
            onDragMove={handleItemDragMove}
            onDragEnd={handleDragEnd}
            sensors={timelineItemSensors}
          >
            <TimelineItemCard id={item.id} name={item.name}>
              {render ? render() : null}
            </TimelineItemCard>
          </DragDropProvider>
        ) : (
          <TimelineItemCardStatic>
            {render ? render() : null}
          </TimelineItemCardStatic>
        )}
        {/* Right resizer */}
        {onMove && (
          <TimelineItemResizer
            direction="right"
            id={item.id}
            ts={endAt?.getTime() ?? addRange(startAt, 2).getTime()}
            onDragStart={beginGesture}
            onDragMove={setDraftEndAt}
            onDragEnd={handleDragEnd}
            onDragCancel={() => setGestureActive(false)}
          />
        )}
      </div>
    </div>
  );
}

interface TimelineItemCardProps extends React.PropsWithChildren {
  id: string;
  name: string;
}

function TimelineItemCard({ id, name, children }: TimelineItemCardProps) {
  const { handleRef, isDragging, ref } = useDraggable({
    id,
    type: "timeline-item",
  });

  return (
    <div
      data-slot="notion-timeline-item-properties"
      className={cn(
        "absolute flex h-[34px] overflow-hidden ps-1.5",
        isDragging && "cursor-grabbing",
      )}
      ref={ref}
    >
      <Button
        ref={handleRef}
        variant="hint"
        size="xs"
        aria-label={`Move ${name}`}
        data-slot="timeline-item-handle"
        className="size-6 shrink-0 cursor-grab touch-none active:cursor-grabbing"
      >
        <Icon.DragHandle className="size-3 fill-icon" />
      </Button>
      {children}
    </div>
  );
}

function TimelineItemCardStatic({ children }: React.PropsWithChildren) {
  return (
    <div
      data-slot="notion-timeline-item-properties"
      className="absolute flex h-[34px] overflow-hidden ps-1.5"
    >
      {children}
    </div>
  );
}
