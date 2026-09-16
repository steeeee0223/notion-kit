"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { DragDropProvider } from "@dnd-kit/react";

import { cn } from "@notion-kit/cn";

import { CalendarContext } from "./calendar-context";
import { minuteOfDay, resolveTimeZone, validEvents } from "./date-utils";
import type { CalendarProviderProps } from "./types";
import {
  calendarPlugins,
  calendarSensors,
  useCalendarDrag,
} from "./use-calendar-drag";

export function CalendarProvider({
  events,
  range: controlledRange,
  defaultRange = "monthly",
  onRangeChange,
  anchorDate: controlledAnchor,
  defaultAnchorDate,
  onAnchorDateChange,
  timeZone: zone,
  weekStartsOn = 1,
  readOnly = false,
  onCreate,
  onEventClick,
  onEventChange,
  className,
  children,
}: CalendarProviderProps) {
  const [localRange, setLocalRange] = useState(defaultRange);
  const [localAnchor, setLocalAnchor] = useState(
    () => defaultAnchorDate ?? Date.now(),
  );
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(timer);
  }, []);
  const range = controlledRange ?? localRange;
  const anchorDate = controlledAnchor ?? localAnchor;
  const timeZone = useMemo(() => resolveTimeZone(zone), [zone]);
  const parsedEvents = useMemo(() => validEvents(events), [events]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const suppressClick = useRef(false);
  const setRange = (next: typeof range) => {
    if (controlledRange === undefined) setLocalRange(next);
    onRangeChange?.(next);
  };
  const setAnchorDate = (next: number) => {
    if (controlledAnchor === undefined) setLocalAnchor(next);
    onAnchorDateChange?.(next);
  };
  const scrollToTime = useCallback((minute: number) => {
    const root = scrollRef.current;
    const grid = root?.querySelector<HTMLElement>(
      '[data-slot="calendar-time-grid"]',
    );
    if (!grid || !root) return;
    const stickyHeight = Array.from(
      root.querySelectorAll<HTMLElement>(
        '[data-slot="calendar-header-toolbar"], [data-slot="calendar-range-header"]',
      ),
    ).reduce(
      (height, element) => height + element.getBoundingClientRect().height,
      0,
    );
    root.scrollTop = grid.offsetTop + minute - stickyHeight - 16;
  }, []);
  useLayoutEffect(() => {
    if (range !== "monthly") scrollToTime(480);
  }, [range, scrollToTime]);
  const today = () => {
    const current = Date.now();
    setNow(current);
    setAnchorDate(current);
    requestAnimationFrame(() => scrollToTime(minuteOfDay(current, timeZone)));
  };
  const drag = useCalendarDrag({
    events: parsedEvents,
    range,
    anchorDate,
    timeZone,
    weekStartsOn,
    canChange: !readOnly && !!onEventChange,
    scrollRef,
    suppressClick,
    onEventChange,
  });
  const displayEvents = useMemo(
    () => (drag.draft ? [...parsedEvents, drag.draft] : parsedEvents),
    [parsedEvents, drag.draft],
  );
  return (
    <DragDropProvider
      sensors={calendarSensors}
      plugins={calendarPlugins}
      onDragStart={drag.onDragStart}
      onDragMove={drag.onDragMove}
      onDragEnd={drag.onDragEnd}
    >
      <CalendarContext
        value={{
          events: displayEvents,
          draft: drag.draft,
          range,
          anchorDate,
          now,
          timeZone,
          weekStartsOn,
          readOnly,
          canCreate: !readOnly && !!onCreate,
          canChange: !readOnly && !!onEventChange,
          scrollRef,
          setRange,
          setAnchorDate,
          today,
          scrollToTime,
          onCreate,
          onEventClick,
          onEventChange,
          suppressClick,
        }}
      >
        <div
          ref={scrollRef}
          data-slot="calendar-view"
          className={cn(
            "relative isolate h-full w-full min-w-0 overflow-x-hidden overflow-y-auto rounded-sm bg-main text-primary",
            className,
          )}
        >
          {children}
        </div>
      </CalendarContext>
    </DragDropProvider>
  );
}
