import React, {
  createContext,
  use,
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { atom, Provider as JotaiProvider, useAtom } from "jotai";
import throttle from "lodash.throttle";

import { cn } from "@notion-kit/cn";
import { resolveTimeZone } from "@notion-kit/utils";

import { TooltipProvider } from "@/primitives";

import { HEADER_HEIGHT, ROW_HEIGHT } from "./constants";
import type {
  TimelineContextProps,
  TimelineFeature,
  TimelineRange,
} from "./types";
import { useAnchorDate } from "./use-anchor-date";
import {
  createTimelineData,
  DEFAULT_END_DATE,
  DEFAULT_START_DATE,
  getOffset,
  noop,
  resolveColumnWidth,
} from "./utils";

const draggingAtom = atom(false);
const scrollXAtom = atom(0);
const sidebarWidthAtom = atom(0);
const containerWidthAtom = atom(0);

export const useTimelineDragging = () => useAtom(draggingAtom);
export const useTimelineScrollX = () => useAtom(scrollXAtom);
export const useTimelineSidebarWidth = () => useAtom(sidebarWidthAtom);
export const useTimelineContainerWidth = () => useAtom(containerWidthAtom);

const TimelineContext = createContext<TimelineContextProps>({
  zoom: 100,
  range: "monthly",
  onAddItem: noop,
  timelineData: {
    start: DEFAULT_START_DATE,
    end: DEFAULT_END_DATE,
    ranges: [],
    subRanges: [],
  },
  ref: null,
  scrollToFeature: noop,
});

export const useTimelineContext = () => use(TimelineContext);

export interface TimelineProviderProps {
  anchorDate?: number;
  defaultAnchorDate?: number;
  onAnchorDateChange?: (date: number) => void;
  timeZone?: string;
  range?: TimelineRange;
  zoom?: number;
  startDate?: number | null;
  endDate?: number | null;
  onAddItem?: (ts: number) => void;
  children: React.ReactNode;
  className?: string;
  sidebarWidth?: number;
}

export function TimelineProvider(props: TimelineProviderProps) {
  return (
    <JotaiProvider>
      <TimelineProviderInner {...props} />
    </JotaiProvider>
  );
}

function TimelineProviderInner({
  anchorDate,
  defaultAnchorDate,
  onAnchorDateChange,
  timeZone,
  zoom = 100,
  range = "monthly",
  sidebarWidth: controlledSidebarWidth,
  onAddItem,
  startDate,
  endDate,
  children,
  className,
}: TimelineProviderProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [, setScrollX] = useTimelineScrollX();
  const [sidebarWidth, setSidebarWidth] = useTimelineSidebarWidth();
  const [containerWidth, setContainerWidth] = useTimelineContainerWidth();

  // Controlled: sync prop → atom
  useEffect(() => {
    if (controlledSidebarWidth !== undefined) {
      setSidebarWidth(controlledSidebarWidth);
    }
  }, [controlledSidebarWidth, setSidebarWidth]);

  // Uncontrolled: MutationObserver detects sidebar element
  useEffect(() => {
    if (controlledSidebarWidth !== undefined) return;

    const updateSidebarWidth = () => {
      const sidebarElement = scrollRef.current?.querySelector(
        '[data-slot="timeline-sidebar"]',
      );
      setSidebarWidth(sidebarElement ? 300 : 0);
    };

    updateSidebarWidth();

    const observer = new MutationObserver(updateSidebarWidth);
    if (scrollRef.current) {
      observer.observe(scrollRef.current, {
        childList: true,
        subtree: true,
      });
    }

    return () => {
      observer.disconnect();
    };
  }, [controlledSidebarWidth, setSidebarWidth]);

  // Track container width via ResizeObserver
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const observer = new ResizeObserver(([entry]) => {
      if (entry) {
        setContainerWidth(entry.contentRect.width);
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [setContainerWidth]);

  // Defer the range so switching range types doesn't block the UI
  const deferredRange = useDeferredValue(range);
  const isPending = deferredRange !== range;

  const resolvedTimeZone = useMemo(() => resolveTimeZone(timeZone), [timeZone]);
  const timelineData = useMemo(
    () =>
      createTimelineData(deferredRange, startDate, endDate, resolvedTimeZone),
    [deferredRange, startDate, endDate, resolvedTimeZone],
  );

  // Memoize CSS variables to prevent unnecessary re-renders
  const cssVariables = useMemo(
    () =>
      ({
        "--timeline-zoom": `${zoom}`,
        "--timeline-inline-padding": `${96}px`,
        "--timeline-column-width": `${resolveColumnWidth(deferredRange, zoom)}px`,
        "--timeline-header-height": `${HEADER_HEIGHT}px`,
        "--timeline-row-height": `${ROW_HEIGHT}px`,
        "--timeline-sidebar-width": `${sidebarWidth}px`,
        "--timeline-item-z": 850,
        gridTemplateColumns: `${sidebarWidth}px 1fr`,
      }) as React.CSSProperties,
    [zoom, deferredRange, sidebarWidth],
  );

  useAnchorDate({
    ref: scrollRef,
    anchorDate,
    defaultAnchorDate,
    onAnchorDateChange,
    timeZone: resolvedTimeZone,
    range: deferredRange,
    zoom,
    sidebarWidth: controlledSidebarWidth ?? sidebarWidth,
    containerWidth,
    timelineData,
    setScrollX,
  });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleScroll = useCallback(
    throttle(() => {
      const scrollElement = scrollRef.current;
      if (!scrollElement) return;
      setScrollX(scrollElement.scrollLeft);
    }, 100),
    [],
  );

  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (scrollElement) {
      scrollElement.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (scrollElement) {
        scrollElement.removeEventListener("scroll", handleScroll);
      }
    };
  }, [handleScroll]);

  const scrollToFeature = useCallback(
    (feature: TimelineFeature) => {
      const scrollElement = scrollRef.current;
      if (!scrollElement) {
        return;
      }

      const offset = getOffset(feature.startAt, {
        zoom,
        range,
        timelineData,
      });

      const targetScrollLeft = Math.max(0, offset - sidebarWidth);

      scrollElement.scrollTo({
        left: targetScrollLeft,
        behavior: "smooth",
      });
    },
    [range, sidebarWidth, timelineData, zoom],
  );

  const ctx = useMemo(
    () => ({
      zoom,
      range: deferredRange,
      timeZone: resolvedTimeZone,
      onAddItem,
      timelineData,
      ref: scrollRef,
      scrollToFeature,
      isPending,
    }),
    [
      deferredRange,
      isPending,
      onAddItem,
      scrollToFeature,
      timelineData,
      zoom,
      resolvedTimeZone,
    ],
  );

  return (
    <TimelineContext value={ctx}>
      <TooltipProvider>
        <div
          data-slot="timeline-view"
          className={cn(
            "relative isolate grid size-full flex-none overflow-auto rounded-sm select-none",
            range,
            className,
          )}
          ref={scrollRef}
          style={cssVariables}
        >
          {children}
        </div>
      </TooltipProvider>
    </TimelineContext>
  );
}
