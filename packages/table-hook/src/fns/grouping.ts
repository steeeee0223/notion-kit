import { TZDate } from "@date-fns/tz";
import {
  addDays,
  differenceInCalendarDays,
  differenceInCalendarWeeks,
  format,
  isValid,
  parse,
  startOfDay,
  startOfMonth,
  startOfWeek,
  startOfYear,
} from "date-fns";

export function groupByValue(value: unknown) {
  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean" ||
    value === null
  ) {
    return value;
  }
  return null;
}

export function groupByTextValue(value: unknown) {
  if (value == null || value === false) return "";
  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return String(value);
  }
  return "";
}

export function groupByTextExact(value: unknown) {
  const text = groupByTextValue(value);
  return text.trim() === "" ? "" : text;
}

export function groupByTextAlphabetical(value: unknown) {
  const text = groupByTextValue(value).trimStart();
  return text === "" ? "" : text[0]!.toLocaleUpperCase();
}

function toFiniteNumber(value: unknown) {
  if (typeof value === "string" && value.trim() === "") return null;
  if (typeof value !== "string" && typeof value !== "number") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

export function groupByNumberInterval(value: unknown, interval: number) {
  const number = toFiniteNumber(value);
  if (number === null || !Number.isFinite(interval) || interval <= 0) {
    return null;
  }
  return Math.floor(number / interval) * interval;
}

export interface DateGroupingOptions {
  timeZone: string;
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  now?: number;
}

export type RelativeDateGroup =
  | "today"
  | "yesterday"
  | "tomorrow"
  | "this-week"
  | "last-week"
  | "next-week"
  | "earlier"
  | "later";

function getDateStart(value: unknown) {
  const candidate =
    typeof value === "number"
      ? value
      : value && typeof value === "object" && "start" in value
        ? (value as { start?: unknown }).start
        : undefined;
  return typeof candidate === "number" &&
    candidate >= 0 &&
    Number.isFinite(candidate)
    ? candidate
    : null;
}

function toZonedDate(value: unknown, timeZone: string) {
  const timestamp = getDateStart(value);
  if (timestamp === null) return null;
  const date = new TZDate(timestamp, timeZone);
  return isValid(date) ? date : null;
}

function formatZonedDate(
  value: unknown,
  options: DateGroupingOptions,
  pattern: string,
) {
  const date = toZonedDate(value, options.timeZone);
  return date === null ? null : format(date, pattern);
}

export function groupByDateDay(value: unknown, options: DateGroupingOptions) {
  return formatZonedDate(value, options, "yyyy-MM-dd");
}

export function groupByDateWeek(value: unknown, options: DateGroupingOptions) {
  const date = toZonedDate(value, options.timeZone);
  if (date === null) return null;
  return format(
    startOfWeek(date, { weekStartsOn: options.weekStartsOn ?? 1 }),
    "yyyy-MM-dd",
  );
}

export function groupByDateMonth(value: unknown, options: DateGroupingOptions) {
  return formatZonedDate(value, options, "yyyy-MM");
}

export function groupByDateYear(value: unknown, options: DateGroupingOptions) {
  return formatZonedDate(value, options, "yyyy");
}

export function groupByDateRelative(
  value: unknown,
  options: DateGroupingOptions,
): RelativeDateGroup | null {
  const date = toZonedDate(value, options.timeZone);
  const today = toZonedDate(options.now ?? Date.now(), options.timeZone);
  if (date === null || today === null) return null;

  const dayDifference = differenceInCalendarDays(date, today);
  if (dayDifference === 0) return "today";
  if (dayDifference === -1) return "yesterday";
  if (dayDifference === 1) return "tomorrow";

  const weekStartsOn = options.weekStartsOn ?? 1;
  const weekDifference = differenceInCalendarWeeks(date, today, {
    weekStartsOn,
  });
  if (weekDifference === 0) return "this-week";
  if (weekDifference === -1) return "last-week";
  if (weekDifference === 1) return "next-week";
  return dayDifference < 0 ? "earlier" : "later";
}

export function dateGroupSortValue(
  value: unknown,
  options: DateGroupingOptions,
) {
  if (typeof value !== "string") return null;
  const zonedToday = toZonedDate(options.now ?? Date.now(), options.timeZone);
  if (zonedToday === null) return null;
  const today = parseDateGroupKey(format(zonedToday, "yyyy-MM-dd"));
  if (today === null) return null;
  const relativeOffsets: Partial<Record<RelativeDateGroup, number>> = {
    "last-week": -7,
    yesterday: -1,
    today: 0,
    tomorrow: 1,
    "this-week": 2,
    "next-week": 7,
  };
  if (value === "earlier") return -Number.MAX_SAFE_INTEGER;
  if (value === "later") return Number.MAX_SAFE_INTEGER;
  const offset = relativeOffsets[value as RelativeDateGroup];
  if (offset !== undefined) return addDays(today, offset).getTime();
  return parseDateGroupKey(value)?.getTime() ?? null;
}

function parseDateGroupKey(value: string) {
  const pattern = /^\d{4}$/.test(value)
    ? "yyyy"
    : /^\d{4}-\d{2}$/.test(value)
      ? "yyyy-MM"
      : /^\d{4}-\d{2}-\d{2}$/.test(value)
        ? "yyyy-MM-dd"
        : null;
  if (pattern === null) return null;

  const parsed = parse(value, pattern, new TZDate(0, "UTC"));
  if (!isValid(parsed) || format(parsed, pattern) !== value) return null;
  if (pattern === "yyyy") return startOfYear(parsed);
  if (pattern === "yyyy-MM") return startOfMonth(parsed);
  return startOfDay(parsed);
}
