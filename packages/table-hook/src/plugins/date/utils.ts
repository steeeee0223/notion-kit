import { TZDate } from "@date-fns/tz";
import { addDays, format, isValid } from "date-fns";

import { formatDate, isoToTs } from "@notion-kit/utils";

import { DateConfig, DateData } from "./types";

export function isValidDateTimestamp(timestamp: unknown): timestamp is number {
  return (
    typeof timestamp === "number" &&
    Number.isFinite(timestamp) &&
    Math.abs(timestamp) <= 8_640_000_000_000_000
  );
}

function isCalendarDayKey(value: string) {
  const match = /^(\d{4,})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (!Number.isSafeInteger(year) || year < 1 || month < 1 || month > 12) {
    return false;
  }
  const leapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const daysInMonth = [
    31,
    leapYear ? 29 : 28,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31,
  ];
  return day >= 1 && day <= daysInMonth[month - 1]!;
}

export function dateDayKey(timestamp: number, timeZone: string) {
  if (!isValidDateTimestamp(timestamp)) return null;
  try {
    const zonedDate = new TZDate(timestamp, timeZone);
    if (!isValid(zonedDate)) return null;
    const dayKey = format(zonedDate, "yyyy-MM-dd");
    return isCalendarDayKey(dayKey) ? dayKey : null;
  } catch (error) {
    if (error instanceof RangeError) return null;
    throw error;
  }
}

export function relativeDateDayKey(
  now: number,
  offsetDays: number,
  timeZone: string,
) {
  if (!isValidDateTimestamp(now) || !Number.isSafeInteger(offsetDays)) {
    return null;
  }
  const today = dateDayKey(now, timeZone);
  if (today === null) return null;
  const localNoon = isoToTs({ date: today, time: "12:00:00" }, timeZone);
  const relative = addDays(localNoon, offsetDays).getTime();
  return isValidDateTimestamp(relative) ? dateDayKey(relative, timeZone) : null;
}

export function toDateString(data: DateData, config: DateConfig) {
  if (data.start === undefined) return "";
  const options = {
    ...config,
    timeFormat: data.includeTime ? config.timeFormat : "hidden",
  };
  const startStr = formatDate(data.start, options);
  if (data.end === undefined) return startStr;
  const endStr = formatDate(data.end, options);
  return `${startStr} → ${endStr}`;
}

function plural(value: number, unit: string) {
  return `${value} ${unit}${value === 1 ? "" : "s"}`;
}

export function formatDateRangeDuration(data: DateData, config: DateConfig) {
  if (data.start === undefined || data.end === undefined) return "";

  if (!data.includeTime) {
    const dateOptions = {
      dateFormat: "_edit_mode" as const,
      timeFormat: "hidden" as const,
      tz: config.tz,
    };
    const start = Date.parse(
      `${formatDate(data.start, dateOptions)}T00:00:00Z`,
    );
    const end = Date.parse(`${formatDate(data.end, dateOptions)}T00:00:00Z`);
    return plural(Math.max(0, Math.round((end - start) / 86_400_000)), "day");
  }

  let minutes = Math.max(0, Math.floor((data.end - data.start) / 60_000));
  const values = [
    [Math.floor(minutes / 1_440), "day"],
    [Math.floor((minutes %= 1_440) / 60), "hour"],
    [(minutes %= 60), "minute"],
  ] as const;
  const parts = values
    .filter(([value]) => value > 0)
    .slice(0, 2)
    .map(([value, unit]) => plural(value, unit));
  return parts.length === 0 ? "0 minutes" : parts.join(" ");
}

const relativeGroupLabels: Record<string, string> = {
  today: "Today",
  yesterday: "Yesterday",
  tomorrow: "Tomorrow",
  "this-week": "This week",
  "last-week": "Last week",
  "next-week": "Next week",
  earlier: "Earlier",
  later: "Later",
};

export function formatDateGroupingLabel(
  value: string,
  methodId: string,
  config: DateConfig,
) {
  const relativeLabel = relativeGroupLabels[value];
  if (relativeLabel) return relativeLabel;
  if (/^\d{4}$/.test(value)) return value;
  if (!/^\d{4}-\d{2}(?:-\d{2})?$/.test(value)) return value;

  const isMonth = /^\d{4}-\d{2}$/.test(value);
  const date = isMonth ? `${value}-01` : value;
  const timestamp = isoToTs({ date, time: "00:00:00" }, config.tz);
  if (isMonth) {
    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      year: "numeric",
      timeZone: config.tz,
    }).format(timestamp);
  }
  const formatted = formatDate(timestamp, {
    dateFormat: config.dateFormat,
    timeFormat: "hidden",
    tz: config.tz,
  });
  return methodId === "week" ? `Week of ${formatted}` : formatted;
}

export function calendarDateToTs(
  selected: Date,
  config: DateConfig,
  previous?: number,
) {
  const date = [
    selected.getFullYear(),
    String(selected.getMonth() + 1).padStart(2, "0"),
    String(selected.getDate()).padStart(2, "0"),
  ].join("-");
  const time =
    previous === undefined
      ? "00:00:00"
      : formatDate(previous, {
          dateFormat: "_edit_mode",
          timeFormat: "_edit_mode",
          tz: config.tz,
        }).split(" ")[1]!;
  return isoToTs({ date, time }, config.tz);
}
