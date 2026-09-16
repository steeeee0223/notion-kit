import { TZDate, tzOffset } from "@date-fns/tz";
import {
  addDays,
  addMonths,
  differenceInCalendarDays,
  format,
  startOfDay,
  startOfWeek,
} from "date-fns";
import { z } from "zod";

import type {
  CalendarEventData,
  CalendarRange,
  CalendarWeekStartsOn,
} from "./types";

export const MINUTE = 60_000;
export const HOUR = 60 * MINUTE;
const timestamp = z
  .number()
  .refine((value) => Number.isFinite(new Date(value).getTime()));
const eventSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    startAt: timestamp,
    endAt: timestamp.nullable(),
    allDay: z.boolean(),
  })
  .refine((event) => event.endAt === null || event.endAt >= event.startAt);
export function validEvents(events: readonly CalendarEventData[]) {
  return events.flatMap((event) => {
    const parsed = eventSchema.safeParse(event);
    return parsed.success ? [parsed.data] : [];
  });
}
export const zonedDate = (value: number, timeZone: string) =>
  new TZDate(value, timeZone);
export const calendarDay = (value: number, timeZone: string) =>
  +startOfDay(zonedDate(value, timeZone));
export const addCalendarDays = (
  value: number,
  days: number,
  timeZone: string,
) => +addDays(zonedDate(value, timeZone), days);
export const dayDifference = (a: number, b: number, timeZone: string) =>
  differenceInCalendarDays(zonedDate(a, timeZone), zonedDate(b, timeZone));
export const dayKey = (value: number, timeZone: string) =>
  format(zonedDate(value, timeZone), "yyyy-MM-dd");
export const minuteOfDay = (value: number, timeZone: string) => {
  const date = zonedDate(value, timeZone);
  return (
    date.getHours() * 60 +
    date.getMinutes() +
    date.getSeconds() / 60 +
    date.getMilliseconds() / 60_000
  );
};
/** Compatible disambiguation: earlier repeated offset, forward through a gap. */
export function localTime(day: number, minute: number, timeZone: string) {
  const date = zonedDate(day, timeZone);
  const wall =
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0) +
    minute * MINUTE;
  const offsets = new Set(
    [-2, -1, 0, 1, 2].map((delta) =>
      tzOffset(timeZone, new Date(wall + delta * 24 * HOUR)),
    ),
  );
  const candidates = [...offsets]
    .map((offset) => wall - offset * MINUTE)
    .sort((a, b) => a - b);
  const wallValue = (value: number) => {
    const local = zonedDate(value, timeZone);
    return Date.UTC(
      local.getFullYear(),
      local.getMonth(),
      local.getDate(),
      local.getHours(),
      local.getMinutes(),
      local.getSeconds(),
      local.getMilliseconds(),
    );
  };
  return (
    candidates.find((value) => wallValue(value) === wall) ??
    candidates
      .filter((value) => wallValue(value) > wall)
      .sort((a, b) => wallValue(a) - wallValue(b))[0] ??
    wall
  );
}
export function effectiveEnd(event: CalendarEventData, timeZone: string) {
  return (
    event.endAt ??
    (event.allDay
      ? addCalendarDays(calendarDay(event.startAt, timeZone), 1, timeZone)
      : event.startAt + HOUR)
  );
}
export function occupiedEndDay(event: CalendarEventData, timeZone: string) {
  return addCalendarDays(
    calendarDay(
      Math.max(event.startAt, effectiveEnd(event, timeZone) - 1),
      timeZone,
    ),
    1,
    timeZone,
  );
}
export function navigateDate(
  date: number,
  range: CalendarRange,
  direction: number,
  timeZone: string,
) {
  return range === "monthly"
    ? +addMonths(zonedDate(date, timeZone), direction)
    : addCalendarDays(date, direction * (range === "weekly" ? 7 : 1), timeZone);
}
export function periodDays(
  anchor: number,
  range: CalendarRange,
  timeZone: string,
  weekStartsOn: CalendarWeekStartsOn,
) {
  const start =
    range === "weekly"
      ? +startOfWeek(zonedDate(anchor, timeZone), { weekStartsOn })
      : calendarDay(anchor, timeZone);
  return Array.from({ length: range === "weekly" ? 7 : 1 }, (_, index) =>
    addCalendarDays(start, index, timeZone),
  );
}
export function periodTitle(
  anchor: number,
  range: CalendarRange,
  timeZone: string,
  weekStartsOn: CalendarWeekStartsOn,
) {
  const date = zonedDate(anchor, timeZone);
  if (range === "monthly") return format(date, "MMMM yyyy");
  if (range === "daily") return format(date, "EEEE, MMMM d, yyyy");
  const days = periodDays(anchor, range, timeZone, weekStartsOn);
  return `${format(zonedDate(days[0]!, timeZone), "MMM d, yyyy")} – ${format(zonedDate(days[6]!, timeZone), "MMM d, yyyy")}`;
}
