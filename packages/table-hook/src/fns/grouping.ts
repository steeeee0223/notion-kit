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
  return typeof candidate === "number" && Number.isFinite(candidate)
    ? candidate
    : null;
}

function zonedDateKey(value: unknown, timeZone: string) {
  const timestamp = getDateStart(value);
  if (timestamp === null) return null;
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(timestamp);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value;
  const year = get("year");
  const month = get("month");
  const day = get("day");
  return year && month && day ? `${year}-${month}-${day}` : null;
}

function dateKeyToUtc(key: string) {
  return Date.parse(`${key}T00:00:00.000Z`);
}

function utcToDateKey(timestamp: number) {
  return new Date(timestamp).toISOString().slice(0, 10);
}

function startOfWeekKey(
  key: string,
  weekStartsOn: NonNullable<DateGroupingOptions["weekStartsOn"]>,
) {
  const timestamp = dateKeyToUtc(key);
  const weekday = new Date(timestamp).getUTCDay();
  const distance = (weekday - weekStartsOn + 7) % 7;
  return utcToDateKey(timestamp - distance * 86_400_000);
}

export function groupByDateDay(value: unknown, options: DateGroupingOptions) {
  return zonedDateKey(value, options.timeZone);
}

export function groupByDateWeek(value: unknown, options: DateGroupingOptions) {
  const key = zonedDateKey(value, options.timeZone);
  return key === null ? null : startOfWeekKey(key, options.weekStartsOn ?? 1);
}

export function groupByDateMonth(value: unknown, options: DateGroupingOptions) {
  return zonedDateKey(value, options.timeZone)?.slice(0, 7) ?? null;
}

export function groupByDateYear(value: unknown, options: DateGroupingOptions) {
  return zonedDateKey(value, options.timeZone)?.slice(0, 4) ?? null;
}

export function groupByDateRelative(
  value: unknown,
  options: DateGroupingOptions,
): RelativeDateGroup | null {
  const key = zonedDateKey(value, options.timeZone);
  const today = zonedDateKey(options.now ?? Date.now(), options.timeZone);
  if (key === null || today === null) return null;

  const dayDifference = (dateKeyToUtc(key) - dateKeyToUtc(today)) / 86_400_000;
  if (dayDifference === 0) return "today";
  if (dayDifference === -1) return "yesterday";
  if (dayDifference === 1) return "tomorrow";

  const weekStartsOn = options.weekStartsOn ?? 1;
  const week = dateKeyToUtc(startOfWeekKey(key, weekStartsOn));
  const thisWeek = dateKeyToUtc(startOfWeekKey(today, weekStartsOn));
  const weekDifference = (week - thisWeek) / (7 * 86_400_000);
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
  const today = zonedDateKey(options.now ?? Date.now(), options.timeZone);
  if (today === null) return null;
  const todayTimestamp = dateKeyToUtc(today);
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
  if (offset !== undefined) return todayTimestamp + offset * 86_400_000;
  if (/^\d{4}$/.test(value)) return Date.parse(`${value}-01-01T00:00:00Z`);
  if (/^\d{4}-\d{2}$/.test(value)) {
    return Date.parse(`${value}-01T00:00:00Z`);
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return dateKeyToUtc(value);
  return null;
}
