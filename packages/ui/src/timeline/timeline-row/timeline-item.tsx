import React, { useCallback, useMemo, useState } from "react";
import {
  DndContext,
  MouseSensor,
  useDraggable,
  useSensor,
} from "@dnd-kit/core";
import { restrictToHorizontalAxis } from "@dnd-kit/modifiers";
import { useMouse } from "@uidotdev/usehooks";
import { addDays, differenceInCalendarDays, isSameDay } from "date-fns";

import { cn } from "@notion-kit/cn";

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

function getWidth(
  startAt: number | Date,
  endAt: number | Date | null,
  ctx: TimelineContextProps,
) {
  const columnWidth = resolveColumnWidth(ctx.range, ctx.zoom);

  if (!endAt) {
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
  const [startAt, setStartAt] = useState<Date>(new Date(item.startAt));
  const [endAt, setEndAt] = useState<Date | null>(
    item.endAt ? new Date(item.endAt) : null,
  );

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

  const [previousMouseX, setPreviousMouseX] = useState(0);
  const [previousStartAt, setPreviousStartAt] = useState(startAt);
  const [previousEndAt, setPreviousEndAt] = useState(endAt);

  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: { distance: 10 },
  });

  const handleItemDragStart = () => {
    setDragging(true);
    setPreviousMouseX(mousePosition.x);
    setPreviousStartAt(startAt);
    setPreviousEndAt(endAt);
  };

  const handleItemDragMove = useCallback(() => {
    const currentDate = getDateByMousePosition(timeline, mousePosition.x);
    const originalDate = getDateByMousePosition(timeline, previousMouseX);
    const delta =
      timeline.range === "daily"
        ? differenceInFn[timeline.range](currentDate, originalDate)
        : innerDifferenceInFn[timeline.range](currentDate, originalDate);
    const newStartDate = addDays(previousStartAt, delta);
    const newEndDate = previousEndAt ? addDays(previousEndAt, delta) : null;

    setStartAt(newStartDate);
    setEndAt(newEndDate);
  }, [
    timeline,
    mousePosition.x,
    previousMouseX,
    previousStartAt,
    previousEndAt,
  ]);

  const handleDragEnd = () => {
    setDragging(false);
    onMove?.(item.id, startAt.getTime(), endAt?.getTime() ?? null);
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
            onDragMove={setStartAt}
            onDragEnd={handleDragEnd}
          />
        )}
        {/* Item card */}
        <DndContext
          modifiers={[restrictToHorizontalAxis]}
          onDragStart={handleItemDragStart}
          onDragMove={handleItemDragMove}
          onDragEnd={handleDragEnd}
          sensors={[mouseSensor]}
        >
          <TimelineItemCard id={item.id}>
            {render ? render() : null}
          </TimelineItemCard>
        </DndContext>
        {/* Right resizer */}
        {onMove && (
          <TimelineItemResizer
            direction="right"
            id={item.id}
            ts={endAt?.getTime() ?? addRange(startAt, 2).getTime()}
            onDragMove={setEndAt}
            onDragEnd={handleDragEnd}
          />
        )}
      </div>
    </div>
  );
}

interface TimelineItemCardProps extends React.PropsWithChildren {
  id: string;
}

function TimelineItemCard({ id, children }: TimelineItemCardProps) {
  const { isDragging, attributes, listeners, setNodeRef } = useDraggable({
    id,
  });

  return (
    <div
      data-slot="notion-timeline-item-properties"
      className={cn(
        "absolute flex h-[34px] overflow-hidden ps-1.5",
        isDragging && "cursor-grabbing",
      )}
      {...attributes}
      {...listeners}
      ref={setNodeRef}
    >
      {children}
    </div>
  );
}
