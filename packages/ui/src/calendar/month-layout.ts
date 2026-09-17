import { endOfMonth, startOfMonth, startOfWeek } from "date-fns";

import {
  addCalendarDays,
  calendarDay,
  dayDifference,
  occupiedEndDay,
  zonedDate,
} from "./date-utils";
import type {
  CalendarArea,
  CalendarEventData,
  CalendarEventSegment,
  CalendarWeekStartsOn,
} from "./types";

export function monthDays(
  anchor: number,
  timeZone: string,
  weekStartsOn: CalendarWeekStartsOn = 1,
) {
  const month = startOfMonth(zonedDate(anchor, timeZone));
  const first = +startOfWeek(month, { weekStartsOn });
  const length =
    Math.ceil((dayDifference(+endOfMonth(month), first, timeZone) + 1) / 7) * 7;
  return Array.from({ length }, (_, index) =>
    addCalendarDays(first, index, timeZone),
  );
}

export interface CalendarDayRow {
  days: number[];
  segments: CalendarEventSegment[];
  laneCount: number;
}

export function layoutDayEvents(
  events: readonly CalendarEventData[],
  days: readonly number[],
  timeZone: string,
  columns = 7,
  area: CalendarArea = "month",
): CalendarDayRow[] {
  const rows: CalendarDayRow[] = [];
  for (let offset = 0; offset < days.length; offset += columns) {
    const rowDays = days.slice(offset, offset + columns);
    const first = rowDays[0]!;
    const limit = addCalendarDays(rowDays.at(-1)!, 1, timeZone);
    const candidates = events
      .map((event, index) => ({
        event,
        index,
        start: calendarDay(event.startAt, timeZone),
        end: occupiedEndDay(event, timeZone),
      }))
      .filter(({ start, end }) => start < limit && end > first)
      .sort(
        (a, b) =>
          a.start - b.start ||
          b.end - b.start - (a.end - a.start) ||
          a.index - b.index ||
          a.event.id.localeCompare(b.event.id),
      );
    const lanes: number[] = [];
    const segments = candidates.map(({ event, start, end }) => {
      const day = Math.max(first, start);
      const column = dayDifference(day, first, timeZone);
      const span = dayDifference(Math.min(limit, end), day, timeZone);
      let lane = lanes.findIndex((occupied) => occupied <= column);
      if (lane < 0) lane = lanes.length;
      lanes[lane] = column + span;
      return {
        key: `${event.id}:${day}:${area}`,
        event,
        area,
        day,
        dayOffset: dayDifference(day, start, timeZone),
        isStart: start >= first,
        isEnd: end <= limit,
        column,
        span,
        lane,
        startMinute: 0,
        endMinute: 1440,
        columnCount: 1,
      };
    });
    rows.push({ days: rowDays, segments, laneCount: lanes.length });
  }
  return rows;
}
