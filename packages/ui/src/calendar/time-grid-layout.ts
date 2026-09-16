import {
  addCalendarDays,
  dayDifference,
  effectiveEnd,
  minuteOfDay,
} from "./date-utils";
import type { CalendarEventData, CalendarEventSegment } from "./types";

export const MIN_VISUAL_MINUTES = 30;
export function layoutTimedEvents(
  events: readonly CalendarEventData[],
  days: readonly number[],
  timeZone: string,
) {
  return days.flatMap((day, dayIndex) => {
    const next = addCalendarDays(day, 1, timeZone);
    const segments = events
      .flatMap((event, index) => {
        const end = effectiveEnd(event, timeZone);
        if (
          event.allDay ||
          event.startAt >= next ||
          Math.max(event.startAt + 1, end) <= day
        )
          return [];
        const startMinute =
          event.startAt <= day ? 0 : minuteOfDay(event.startAt, timeZone);
        const endMinute = end >= next ? 1440 : minuteOfDay(end, timeZone);
        return [
          {
            key: `${event.id}:${day}:time`,
            event,
            area: "time" as const,
            day,
            dayOffset: dayDifference(day, event.startAt, timeZone),
            isStart: event.startAt >= day,
            isEnd: end <= next,
            column: 0,
            span: 1,
            lane: dayIndex,
            startMinute,
            endMinute,
            columnCount: 1,
            index,
            visualEnd: Math.min(
              1440,
              Math.max(startMinute + MIN_VISUAL_MINUTES, endMinute),
            ),
          },
        ];
      })
      .sort(
        (a, b) =>
          a.startMinute - b.startMinute ||
          b.visualEnd - a.visualEnd ||
          a.index - b.index ||
          a.event.id.localeCompare(b.event.id),
      );
    let group: typeof segments = [];
    let groupEnd = -1;
    const finish = () => {
      const count = Math.max(1, ...group.map((segment) => segment.column + 1));
      group.forEach((segment) => {
        segment.columnCount = count;
      });
      group = [];
    };
    for (const segment of segments) {
      if (segment.startMinute >= groupEnd) finish();
      const occupied = new Set(
        group
          .filter((other) => other.visualEnd > segment.startMinute)
          .map((other) => other.column),
      );
      while (occupied.has(segment.column)) segment.column++;
      group.push(segment);
      groupEnd = Math.max(groupEnd, segment.visualEnd);
    }
    finish();
    return segments as CalendarEventSegment[];
  });
}
