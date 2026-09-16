import {
  addCalendarDays,
  calendarDay,
  dayDifference,
  effectiveEnd,
  HOUR,
  localTime,
  MINUTE,
  minuteOfDay,
  occupiedEndDay,
} from "./date-utils";
import type {
  CalendarArea,
  CalendarEventChange,
  CalendarEventChangeReason,
  CalendarEventData,
} from "./types";

export interface CalendarTarget {
  day: number;
  minute?: number;
  area: CalendarArea;
}
export function transformEvent(
  event: CalendarEventData,
  target: CalendarTarget,
  reason: Exclude<CalendarEventChangeReason, "convert">,
  dayOffset: number,
  timeZone: string,
): CalendarEventChange {
  const originalEnd = effectiveEnd(event, timeZone);
  const targetDay = addCalendarDays(
    target.day,
    reason === "move" ? -dayOffset : 0,
    timeZone,
  );
  const timed = target.area === "time";
  const startDay = calendarDay(event.startAt, timeZone);
  const days = Math.max(
    1,
    dayDifference(occupiedEndDay(event, timeZone), startDay, timeZone),
  );
  const minute = Math.round((target.minute ?? 0) / 15) * 15;
  let startAt = event.startAt,
    endAt = event.endAt,
    allDay = event.allDay;
  if (reason === "move") {
    if (timed && event.allDay) {
      startAt = localTime(targetDay, minute, timeZone);
      endAt =
        localTime(
          addCalendarDays(targetDay, days - 1, timeZone),
          minute,
          timeZone,
        ) + HOUR;
      allDay = false;
      return { id: event.id, startAt, endAt, allDay, reason: "convert" };
    }
    if (target.area === "all-day" && !event.allDay)
      return {
        id: event.id,
        startAt: targetDay,
        endAt: addCalendarDays(targetDay, days, timeZone),
        allDay: true,
        reason: "convert",
      };
    startAt = timed
      ? localTime(targetDay, minute, timeZone)
      : event.allDay
        ? targetDay
        : localTime(targetDay, minuteOfDay(event.startAt, timeZone), timeZone);
    endAt =
      event.endAt === null
        ? null
        : event.allDay
          ? addCalendarDays(startAt, days, timeZone)
          : startAt + event.endAt - event.startAt;
  } else {
    const minimum = event.allDay ? 0 : 15 * MINUTE;
    if (reason === "resize-start") {
      endAt = originalEnd;
      const proposed = timed
        ? localTime(target.day, minute, timeZone)
        : event.allDay
          ? target.day
          : localTime(
              target.day,
              minuteOfDay(event.startAt, timeZone),
              timeZone,
            );
      startAt = Math.min(
        proposed,
        event.allDay
          ? addCalendarDays(originalEnd, -1, timeZone)
          : originalEnd - minimum,
      );
    } else {
      const proposed = timed
        ? localTime(target.day, minute, timeZone)
        : event.allDay
          ? addCalendarDays(target.day, 1, timeZone)
          : localTime(
              addCalendarDays(
                target.day,
                originalEnd === calendarDay(originalEnd, timeZone) ? 1 : 0,
                timeZone,
              ),
              minuteOfDay(originalEnd, timeZone),
              timeZone,
            );
      endAt = Math.max(
        proposed,
        event.allDay
          ? addCalendarDays(startAt, 1, timeZone)
          : startAt + minimum,
      );
    }
  }
  return { id: event.id, startAt, endAt, allDay, reason };
}
