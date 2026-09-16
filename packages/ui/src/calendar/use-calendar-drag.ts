import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import {
  AutoScroller,
  Feedback,
  PointerActivationConstraints,
  PointerSensor,
} from "@dnd-kit/dom";
import type {
  DragDropProvider,
  DragEndEvent,
  DragMoveEvent,
  DragStartEvent,
} from "@dnd-kit/react";
import { z } from "zod";

import { dayDifference, minuteOfDay } from "./date-utils";
import { transformEvent, type CalendarTarget } from "./event-transforms";
import type {
  CalendarEventChange,
  CalendarEventData,
  CalendarProviderProps,
  CalendarRange,
} from "./types";

export const calendarSensors = [
  PointerSensor.configure({
    activationConstraints: [
      new PointerActivationConstraints.Distance({ value: 6 }),
    ],
  }),
];
export const calendarPlugins: React.ComponentProps<
  typeof DragDropProvider
>["plugins"] = (defaults) => [
  ...defaults.filter(
    (plugin) => plugin !== AutoScroller && plugin !== Feedback,
  ),
  Feedback.configure({ feedback: "none" }),
];
const sourceSchema = z.object({
  eventId: z.string(),
  segmentDay: z.number(),
  reason: z.enum(["move", "resize-start", "resize-end"]),
});
const targetSchema = z.object({
  area: z.enum(["month", "all-day", "time"]),
  day: z.coerce.number().finite(),
});
interface DragOptions {
  events: readonly CalendarEventData[];
  range: CalendarRange;
  anchorDate: number;
  timeZone: string;
  weekStartsOn: number;
  canChange: boolean;
  scrollRef: React.RefObject<HTMLDivElement | null>;
  suppressClick: React.RefObject<boolean>;
  onEventChange: CalendarProviderProps["onEventChange"];
}
interface Gesture {
  event: CalendarEventData;
  reason: "move" | "resize-start" | "resize-end";
  dayOffset: number;
  grabbedMinute: number | undefined;
  signature: string;
  change: CalendarEventChange | null;
  point: { x: number; y: number };
}
export function useCalendarDrag(options: DragOptions) {
  const {
    events,
    range,
    anchorDate,
    timeZone,
    weekStartsOn,
    canChange,
    scrollRef,
    suppressClick: suppressClickRef,
    onEventChange,
  } = options;
  const [draftState, setDraftState] = useState<{
    event: CalendarEventData;
    signature: string;
  } | null>(null);
  const gesture = useRef<Gesture | null>(null);
  const frame = useRef<number | null>(null);
  const clickTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const signature = JSON.stringify([
    events,
    range,
    anchorDate,
    timeZone,
    weekStartsOn,
    canChange,
  ]);
  function targetAt(point: { x: number; y: number }): CalendarTarget | null {
    const root = scrollRef.current;
    if (!root) return null;
    const bounds = root.getBoundingClientRect();
    if (
      point.x < bounds.left ||
      point.x >= bounds.right ||
      point.y < bounds.top ||
      point.y >= bounds.bottom
    )
      return null;
    const header = root.querySelector<HTMLElement>(
      '[data-slot="calendar-range-header"]',
    );
    const headerBounds = header?.getBoundingClientRect();
    if (headerBounds && point.y < headerBounds.bottom) return null;
    for (const element of root.querySelectorAll<HTMLElement>(
      "[data-calendar-drop]",
    )) {
      const box = element.getBoundingClientRect();
      if (
        point.x < box.left ||
        point.x >= box.right ||
        point.y < box.top ||
        point.y >= box.bottom
      )
        continue;
      const parsed = targetSchema.safeParse({
        area: element.dataset.calendarDrop,
        day: element.dataset.day,
      });
      if (!parsed.success) continue;
      return {
        ...parsed.data,
        minute: parsed.data.area === "time" ? point.y - box.top : undefined,
      };
    }
    return null;
  }
  function preview(point: { x: number; y: number }) {
    const active = gesture.current;
    if (!active) return;
    active.point = point;
    const target = targetAt(point);
    // Resizing never changes the event's all-day/timed kind.
    if (
      !target ||
      (active.reason !== "move" &&
        target.area !== "month" &&
        (target.area === "time") === active.event.allDay)
    ) {
      active.change = null;
      setDraftState(null);
      return;
    }
    if (target.minute !== undefined) {
      // Snap movement relative to the grab point so a horizontal drag keeps the exact start time.
      target.minute =
        active.reason === "move" &&
        !active.event.allDay &&
        active.grabbedMinute !== undefined
          ? minuteOfDay(active.event.startAt, timeZone) +
            Math.round((target.minute - active.grabbedMinute) / 15) * 15
          : Math.round(target.minute / 15) * 15;
    }
    active.change = transformEvent(
      active.event,
      target,
      active.reason,
      active.dayOffset,
      timeZone,
    );
    setDraftState({
      event: { ...active.event, ...active.change },
      signature: active.signature,
    });
  }
  const reset = useCallback(() => {
    gesture.current = null;
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    frame.current = null;
    if (clickTimer.current !== null) clearTimeout(clickTimer.current);
    clickTimer.current = setTimeout(() => {
      suppressClickRef.current = false;
    }, 0);
  }, [suppressClickRef]);
  const finish = useCallback(() => {
    reset();
    setDraftState(null);
  }, [reset]);
  function autoScroll() {
    const active = gesture.current;
    const root = scrollRef.current;
    if (!active || !root) return;
    const bounds = root.getBoundingClientRect();
    const { x, y } = active.point;
    if (
      x >= bounds.left &&
      x < bounds.right &&
      y >= bounds.top &&
      y < bounds.bottom
    ) {
      const delta =
        y < bounds.top + 64
          ? -Math.ceil((bounds.top + 64 - y) / 4)
          : y > bounds.bottom - 48
            ? Math.ceil((y - bounds.bottom + 48) / 4)
            : 0;
      if (delta) {
        root.scrollTop += delta;
        preview(active.point);
      }
    }
    frame.current = requestAnimationFrame(autoScroll);
  }
  const onDragStart = (event: DragStartEvent) => {
    if (!canChange) return;
    const parsed = sourceSchema.safeParse(event.operation.source?.data);
    if (!parsed.success) return;
    const source = events.find((item) => item.id === parsed.data.eventId);
    if (!source) return;
    const point = event.operation.position.initial;
    const target = targetAt(point);
    gesture.current = {
      event: source,
      reason: parsed.data.reason,
      dayOffset: dayDifference(
        target?.day ?? parsed.data.segmentDay,
        source.startAt,
        timeZone,
      ),
      grabbedMinute: target?.minute,
      signature,
      change: null,
      point: event.operation.position.current,
    };
    suppressClickRef.current = true;
    preview(event.operation.position.current);
    frame.current = requestAnimationFrame(autoScroll);
  };
  const onDragMove = (event: DragMoveEvent) => {
    // The move event precedes the update to operation.position.current.
    const current = event.operation.position.current;
    preview(
      event.to ?? {
        x: current.x + (event.by?.x ?? 0),
        y: current.y + (event.by?.y ?? 0),
      },
    );
  };
  const onDragEnd = (event: DragEndEvent) => {
    const active = gesture.current;
    if (!active) return;
    if (!event.canceled && active.signature === signature)
      preview(event.operation.position.current);
    const change = active.change;
    finish();
    if (event.canceled || active.signature !== signature || !change) return;
    if (
      change.startAt === active.event.startAt &&
      change.endAt === active.event.endAt &&
      change.allDay === active.event.allDay
    )
      return;
    onEventChange?.(change);
  };
  useLayoutEffect(() => {
    if (gesture.current && gesture.current.signature !== signature) reset();
  }, [signature, reset]);
  useEffect(() => {
    const cancel = (event: KeyboardEvent) => {
      if (event.key === "Escape" && gesture.current) finish();
    };
    document.addEventListener("keydown", cancel);
    return () => {
      document.removeEventListener("keydown", cancel);
      if (frame.current !== null) cancelAnimationFrame(frame.current);
      if (clickTimer.current !== null) clearTimeout(clickTimer.current);
    };
  }, [finish]);
  return {
    draft: draftState?.signature === signature ? draftState.event : null,
    onDragStart,
    onDragMove,
    onDragEnd,
  };
}
