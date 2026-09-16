import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { TZDate } from "@date-fns/tz";
import {
  addDays,
  addMonths,
  addQuarters,
  differenceInCalendarDays,
  differenceInCalendarMonths,
  differenceInCalendarQuarters,
  startOfDay,
  startOfMonth,
  startOfQuarter,
} from "date-fns";

import type { TimelineData, TimelineRange } from "./types";
import { resolveColumnWidth } from "./utils";

interface AnchorOptions {
  ref: React.RefObject<HTMLDivElement | null>;
  anchorDate?: number;
  defaultAnchorDate?: number;
  onAnchorDateChange?: (date: number) => void;
  timeZone: string;
  range: TimelineRange;
  zoom: number;
  sidebarWidth: number;
  containerWidth: number;
  timelineData: TimelineData;
  setScrollX: (position: number) => void;
}

export function useAnchorDate(options: AnchorOptions) {
  const {
    ref,
    anchorDate,
    defaultAnchorDate,
    onAnchorDateChange,
    timeZone: zone,
    range,
    zoom,
    sidebarWidth,
    containerWidth,
    timelineData,
    setScrollX,
  } = options;
  const [initialAnchor] = useState(
    () => anchorDate ?? defaultAnchorDate ?? Date.now(),
  );
  const current = useRef(initialAnchor);
  const positioned = useRef<number | null>(null);
  const previousGeometry = useRef<string | null>(null);
  const latestChange = useRef(onAnchorDateChange);
  useLayoutEffect(() => {
    latestChange.current = onAnchorDateChange;
  }, [onAnchorDateChange]);

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    const geometry = [
      range,
      zoom,
      sidebarWidth,
      containerWidth,
      element.clientWidth,
      timelineData.start.getTime(),
      timelineData.end.getTime(),
      zone,
    ].join(":");
    const acceptedScroll =
      anchorDate === current.current &&
      positioned.current === null &&
      previousGeometry.current === geometry;
    previousGeometry.current = geometry;
    // An owner accepting our scroll report must not interrupt the browser's ongoing scroll.
    if (acceptedScroll) return;
    const zoned = (value: number | Date) => new TZDate(Number(value), zone);
    const startOf =
      range === "daily"
        ? startOfDay
        : range === "monthly"
          ? startOfMonth
          : startOfQuarter;
    const origin = startOf(zoned(timelineData.start));
    const target = zoned(anchorDate ?? current.current);
    const period = startOf(target);
    const columns =
      range === "daily"
        ? differenceInCalendarDays(period, origin)
        : range === "monthly"
          ? differenceInCalendarMonths(period, origin)
          : differenceInCalendarQuarters(period, origin);
    const next =
      range === "daily"
        ? addDays(period, 1)
        : range === "monthly"
          ? addMonths(period, 1)
          : addQuarters(period, 1);
    const fraction =
      differenceInCalendarDays(target, period) /
      differenceInCalendarDays(next, period);
    const columnWidth = resolveColumnWidth(range, zoom);
    const visible = Math.max(0, element.clientWidth - sidebarWidth);
    const requested = (columns + fraction) * columnWidth - visible / 2;
    const maximum = Math.max(
      0,
      (element.scrollWidth > 0
        ? element.scrollWidth - sidebarWidth
        : timelineData.subRanges.length * columnWidth) - visible,
    );
    element.scrollLeft = Math.max(0, Math.min(maximum, requested));
    positioned.current = element.scrollLeft;
    current.current = anchorDate ?? current.current;
    setScrollX(element.scrollLeft);
    if (Math.abs(element.scrollLeft - requested) > 0.5) {
      const date = dateAtPosition(
        element.scrollLeft + visible / 2,
        origin,
        range,
        columnWidth,
      );
      if (date !== current.current) {
        current.current = date;
        latestChange.current?.(date);
      }
    }
  }, [
    ref,
    anchorDate,
    zone,
    range,
    zoom,
    sidebarWidth,
    containerWidth,
    timelineData,
    setScrollX,
  ]);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const start = new TZDate(timelineData.start.getTime(), zone);
    const origin =
      range === "daily"
        ? startOfDay(start)
        : range === "monthly"
          ? startOfMonth(start)
          : startOfQuarter(start);
    const onScroll = () => {
      if (
        positioned.current !== null &&
        Math.abs(element.scrollLeft - positioned.current) < 0.5
      )
        return;
      positioned.current = null;
      const date = dateAtPosition(
        element.scrollLeft +
          Math.max(0, element.clientWidth - sidebarWidth) / 2,
        origin,
        range,
        resolveColumnWidth(range, zoom),
      );
      if (date !== current.current) {
        current.current = date;
        latestChange.current?.(date);
      }
    };
    // Navigation reports synchronously: throttled rendering must not lose the last scroll before a layout unmount.
    element.addEventListener("scroll", onScroll, { passive: true });
    return () => element.removeEventListener("scroll", onScroll);
  }, [ref, range, zoom, sidebarWidth, timelineData, zone]);
}

function dateAtPosition(
  position: number,
  origin: Date,
  range: TimelineRange,
  width: number,
) {
  const column = Math.floor(position / width);
  const period =
    range === "daily"
      ? addDays(origin, column)
      : range === "monthly"
        ? addMonths(origin, column)
        : addQuarters(origin, column);
  if (range === "daily") return period.getTime();
  const next =
    range === "monthly" ? addMonths(period, 1) : addQuarters(period, 1);
  const days = differenceInCalendarDays(next, period);
  return addDays(
    period,
    Math.floor((position / width - column) * days + 0.000001),
  ).getTime();
}
