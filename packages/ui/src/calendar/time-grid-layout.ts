import {
  addCalendarDays,
  dayDifference,
  effectiveEnd,
  minuteOfDay,
} from "./date-utils";
import type { CalendarEventData, CalendarEventSegment } from "./types";

const MIN_VISUAL_MINUTES = 30;

interface TimedEventSegment extends CalendarEventSegment {
  visualStart: number;
  visualEnd: number;
}

export function layoutTimedEvents(
  events: readonly CalendarEventData[],
  days: readonly number[],
  timeZone: string,
): TimedEventSegment[] {
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
        const visualStart = Math.min(startMinute, 1440 - MIN_VISUAL_MINUTES);
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
            visualStart,
            visualEnd: Math.min(
              1440,
              Math.max(visualStart + MIN_VISUAL_MINUTES, endMinute),
            ),
          },
        ];
      })
      .sort(
        (a, b) =>
          a.visualStart - b.visualStart ||
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
      if (segment.visualStart >= groupEnd) finish();
      const occupied = new Set(
        group
          .filter((other) => other.visualEnd > segment.visualStart)
          .map((other) => other.column),
      );
      while (occupied.has(segment.column)) segment.column++;
      group.push(segment);
      groupEnd = Math.max(groupEnd, segment.visualEnd);
    }
    finish();
    return segments;
  });
}
