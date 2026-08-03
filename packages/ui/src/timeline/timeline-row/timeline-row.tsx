import React, { useCallback, useMemo, useRef, useState } from "react";
import { RestrictToHorizontalAxis } from "@dnd-kit/abstract/modifiers";
import { PointerActivationConstraints, PointerSensor } from "@dnd-kit/dom";
import {
  DragDropProvider,
  type DragEndEvent,
  type DragMoveEvent,
  type DragStartEvent,
} from "@dnd-kit/react";
import { useMouse } from "@uidotdev/usehooks";
import { addDays, differenceInCalendarDays, isSameDay } from "date-fns";

import { cn } from "@notion-kit/cn";

import {
  useTimelineContext,
  useTimelineDragging,
  useTimelineScrollX,
} from "../timeline-provider";
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
import { TimelineRowItem } from "./timeline-item";
import { TimelineRowResize } from "./timeline-item-resizer";
import { TimelineJumpToItem } from "./timeline-jump-to-item";
import {
  TimelineRowContext,
  useTimelineRowContext,
  type TimelineRowContextValue,
  type TimelineRowGesture,
} from "./timeline-row-context";

const timelineRowSensors: React.ComponentProps<
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
  timeline: TimelineContextProps,
) {
  const columnWidth = resolveColumnWidth(timeline.range, timeline.zoom);

  if (endAt === null) return columnWidth * 2;

  const differenceIn = differenceInFn[timeline.range];
  if (timeline.range === "daily") {
    const delta = differenceIn(endAt, startAt);
    return columnWidth * (delta ? delta : 1);
  }

  const startOf = startOfFn[timeline.range];
  const daysIn = daysInFn[timeline.range];
  const daysInStartRange = daysIn(startAt);
  const pixelsPerDayInStartRange = columnWidth / daysInStartRange;

  if (isSameDay(startAt, endAt)) return pixelsPerDayInStartRange;

  const innerDifferenceIn = innerDifferenceInFn[timeline.range];
  if (isSameDay(startOf(startAt), startOf(endAt))) {
    return (
      snapDays(innerDifferenceIn(endAt, startAt), timeline.range) *
      pixelsPerDayInStartRange
    );
  }

  const startRangeStart = startOf(startAt);
  const startRangeOffset = snapDays(
    daysInStartRange - differenceInCalendarDays(startAt, startRangeStart),
    timeline.range,
  );
  const endRangeStart = startOf(endAt);
  const endRangeOffset = snapDays(
    differenceInCalendarDays(endAt, endRangeStart),
    timeline.range,
  );
  const fullRangeOffset = differenceIn(endRangeStart, startRangeStart);
  const pixelsPerDayInEndRange = columnWidth / daysIn(endAt);

  return (
    (fullRangeOffset - 1) * columnWidth +
    startRangeOffset * pixelsPerDayInStartRange +
    endRangeOffset * pixelsPerDayInEndRange
  );
}

export interface TimelineRowRootProps extends React.PropsWithChildren {
  item: TimelineFeature;
  onMove?: (id: string, start: number, end: number | null) => void;
}

function getGesture(event: DragStartEvent): TimelineRowGesture | null {
  const source = event.operation.source;
  if (source?.type === "timeline-item") return "move";
  if (source?.type !== "timeline-item-resizer") return null;

  const direction = source.data.direction as unknown;
  if (direction === "start") return "resize-start";
  if (direction === "end") return "resize-end";
  return null;
}

function TimelineRowRoot({ item, onMove, children }: TimelineRowRootProps) {
  const timeline = useTimelineContext();
  const [scrollX] = useTimelineScrollX();
  const [, setDragging] = useTimelineDragging();
  const [mousePosition] = useMouse<HTMLDivElement>();
  const authoritativeStartAt = useMemo(
    () => new Date(item.startAt),
    [item.startAt],
  );
  const authoritativeEndAt = useMemo(
    () => (item.endAt === null ? null : new Date(item.endAt)),
    [item.endAt],
  );
  const [draftStartAt, setDraftStartAt] = useState(authoritativeStartAt);
  const [draftEndAt, setDraftEndAt] = useState(authoritativeEndAt);
  const [gesture, setGesture] = useState<TimelineRowGesture | null>(null);
  const gestureRef = useRef<TimelineRowGesture | null>(null);
  const draftStartAtRef = useRef(authoritativeStartAt);
  const draftEndAtRef = useRef(authoritativeEndAt);
  const moveOriginRef = useRef<{
    mouseX: number;
    startAt: Date;
    endAt: Date | null;
  } | null>(null);
  const suppressItemClickRef = useRef(false);
  const suppressItemClickTimerRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);

  const begin = useCallback(
    (nextGesture: TimelineRowGesture) => {
      if (!onMove) return;

      draftStartAtRef.current = authoritativeStartAt;
      draftEndAtRef.current = authoritativeEndAt;
      setDraftStartAt(authoritativeStartAt);
      setDraftEndAt(authoritativeEndAt);
      gestureRef.current = nextGesture;
      setGesture(nextGesture);
      setDragging(true);

      if (nextGesture === "move") {
        moveOriginRef.current = {
          mouseX: mousePosition.x,
          startAt: authoritativeStartAt,
          endAt: authoritativeEndAt,
        };
        suppressItemClickRef.current = true;
      }
    },
    [
      authoritativeEndAt,
      authoritativeStartAt,
      mousePosition.x,
      onMove,
      setDragging,
    ],
  );

  const move = useCallback(() => {
    const activeGesture = gestureRef.current;
    if (!activeGesture) return;

    if (activeGesture === "move") {
      const origin = moveOriginRef.current;
      if (!origin) return;
      const currentDate = getDateByMousePosition(timeline, mousePosition.x);
      const originalDate = getDateByMousePosition(timeline, origin.mouseX);
      const delta =
        timeline.range === "daily"
          ? differenceInFn[timeline.range](currentDate, originalDate)
          : innerDifferenceInFn[timeline.range](currentDate, originalDate);
      const nextStartAt = addDays(origin.startAt, delta);
      const nextEndAt =
        origin.endAt === null ? null : addDays(origin.endAt, delta);

      draftStartAtRef.current = nextStartAt;
      draftEndAtRef.current = nextEndAt;
      setDraftStartAt(nextStartAt);
      setDraftEndAt(nextEndAt);
      return;
    }

    const timelineRect = timeline.ref?.current?.getBoundingClientRect();
    const x = mousePosition.x - (timelineRect?.left ?? 0) + scrollX;
    const nextDate = getDateByMousePosition(timeline, x);
    if (activeGesture === "resize-start") {
      draftStartAtRef.current = nextDate;
      setDraftStartAt(nextDate);
    } else {
      draftEndAtRef.current = nextDate;
      setDraftEndAt(nextDate);
    }
  }, [mousePosition.x, scrollX, timeline]);

  const finish = useCallback(() => {
    setDragging(false);
    gestureRef.current = null;
    moveOriginRef.current = null;
    setGesture(null);
  }, [setDragging]);

  const cancel = useCallback(() => {
    draftStartAtRef.current = authoritativeStartAt;
    draftEndAtRef.current = authoritativeEndAt;
    setDraftStartAt(authoritativeStartAt);
    setDraftEndAt(authoritativeEndAt);
    finish();
  }, [authoritativeEndAt, authoritativeStartAt, finish]);

  const commit = useCallback(() => {
    const nextStartAt = draftStartAtRef.current;
    const nextEndAt = draftEndAtRef.current;
    finish();
    onMove?.(item.id, nextStartAt.getTime(), nextEndAt?.getTime() ?? null);
  }, [finish, item.id, onMove]);

  const consumeItemClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      if (!event.defaultPrevented && !suppressItemClickRef.current) {
        return false;
      }

      suppressItemClickRef.current = false;
      event.preventDefault();
      event.stopPropagation();
      return true;
    },
    [],
  );

  const startAt = gesture ? draftStartAt : authoritativeStartAt;
  const endAt = gesture ? draftEndAt : authoritativeEndAt;
  const addRange = addRangeFn[timeline.range];
  const state = useMemo<TimelineRowContextValue["state"]>(
    () => ({
      authoritativeStartAt,
      authoritativeEndAt,
      draftStartAt,
      draftEndAt,
      startAt,
      endAt,
      gesture,
    }),
    [
      authoritativeEndAt,
      authoritativeStartAt,
      draftEndAt,
      draftStartAt,
      endAt,
      gesture,
      startAt,
    ],
  );
  const actions = useMemo<TimelineRowContextValue["actions"]>(
    () => ({ begin, move, cancel, commit, consumeItemClick }),
    [begin, cancel, commit, consumeItemClick, move],
  );
  const meta = useMemo<TimelineRowContextValue["meta"]>(
    () => ({
      item,
      movable: onMove !== undefined,
      width: getWidth(startAt, endAt, timeline),
      offset: getOffset(startAt, timeline),
      resizeEndAt: endAt ?? addRange(startAt, 2),
    }),
    [addRange, endAt, item, onMove, startAt, timeline],
  );
  const context = useMemo<TimelineRowContextValue>(
    () => ({ state, actions, meta }),
    [actions, meta, state],
  );

  const handleDragStart = (event: DragStartEvent) => {
    const nextGesture = getGesture(event);
    if (nextGesture) actions.begin(nextGesture);
  };
  const handleDragMove = (_event: DragMoveEvent) => actions.move();
  const handleDragEnd = (event: DragEndEvent) => {
    if (!gestureRef.current) return;

    if (suppressItemClickRef.current) {
      if (suppressItemClickTimerRef.current) {
        clearTimeout(suppressItemClickTimerRef.current);
      }
      suppressItemClickTimerRef.current = setTimeout(() => {
        suppressItemClickRef.current = false;
      }, 0);
    }

    if (event.canceled) actions.cancel();
    else actions.commit();
  };

  return (
    <TimelineRowContext value={context}>
      <DragDropProvider
        modifiers={[RestrictToHorizontalAxis]}
        onDragStart={handleDragStart}
        onDragMove={handleDragMove}
        onDragEnd={handleDragEnd}
        sensors={timelineRowSensors}
      >
        {children}
      </DragDropProvider>
    </TimelineRowContext>
  );
}

type TimelineRowTrackProps = React.ComponentPropsWithoutRef<"div">;

function TimelineRowTrack({
  className,
  children,
  ...props
}: TimelineRowTrackProps) {
  const { meta } = useTimelineRowContext();

  return (
    <div
      {...props}
      data-slot="timeline-item-track"
      className={cn(
        "isolation-auto flex h-(--timeline-row-height) w-full cursor-default",
        className,
      )}
    >
      <div
        data-slot="timeline-item"
        data-notion-slot="notion-timeline-item"
        className="absolute z-(--timeline-item-z) my-px flex h-[34px] rounded-md bg-popover shadow-out-md"
        style={{
          width: Math.round(meta.width),
          insetInlineStart: Math.round(meta.offset),
        }}
      >
        {children}
      </div>
    </div>
  );
}

function TimelineRowJump() {
  const { meta } = useTimelineRowContext();
  return <TimelineJumpToItem item={meta.item} />;
}

export const TimelineRow = {
  Root: TimelineRowRoot,
  Jump: TimelineRowJump,
  Track: TimelineRowTrack,
  Item: TimelineRowItem,
  Resize: TimelineRowResize,
};
