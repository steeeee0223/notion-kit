import { TZDate } from "@date-fns/tz";
import {
  differenceInDays,
  format,
  formatDistance,
  parse,
  startOfDay,
} from "date-fns";

export type DateFormat =
  | "full" // e.g. November 5, 2025
  | "short" // e.g. Nov 5
  | "MM/dd/yyyy"
  | "dd/MM/yyyy"
  | "yyyy/MM/dd"
  | "relative" // e.g. 3 days ago
  | "_edit_mode"; // e.g. 2025-11-05
export type TimeFormat = "hidden" | "12-hour" | "24-hour" | "_edit_mode";
export interface FormatOptions {
  dateFormat: DateFormat;
  timeFormat: TimeFormat;
  /**
   * @prop GMT timezone string
   * @example Asia/Taipei
   */
  tz?: string;
}

function getDateFormatStr(format: DateFormat) {
  switch (format) {
    case "full":
      return "MMMM d, yyyy";
    case "short":
      return "MMM d";
    case "MM/dd/yyyy":
    case "dd/MM/yyyy":
    case "yyyy/MM/dd":
      return format;
    case "_edit_mode":
      return "yyyy-MM-dd";
    default:
      return "";
  }
}

function getTimeFormatStr(format: TimeFormat) {
  switch (format) {
    case "12-hour":
      return "hh:mm aa";
    case "24-hour":
      return "HH:mm";
    case "_edit_mode":
      return "HH:mm:ss";
    default:
      return "";
  }
}

/**
 * Format a timestamp into a date string based on the specified format.
 * @param ts timestamp in ms
 * @todo format with timezone
 */
export function formatDate(ts: number, options: FormatOptions): string {
  if (ts < 0) return "";
  const timeStr = getTimeFormatStr(options.timeFormat);
  if (options.dateFormat !== "relative") {
    const formatStr =
      getDateFormatStr(options.dateFormat) + (timeStr ? ` ${timeStr}` : "");
    const date = new TZDate(ts, options.tz);
    return format(date, formatStr);
  }

  const now = new Date();
  if (timeStr) {
    return formatDistance(ts, now, {
      addSuffix: true,
      includeSeconds: false,
    });
  }

  const today = startOfDay(now);
  const target = startOfDay(ts);
  const diffDays = differenceInDays(today, target);

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays === -1) return "Tomorrow";

  return formatDistance(target, today, {
    addSuffix: true,
    includeSeconds: false,
  });
}

export function isoToTs(iso: { date: string; time: string }): number {
  if (!iso.date) return -1;
  const dateStr = `${iso.date} ${iso.time || "00:00:00"}`;
  const date = parse(dateStr, "yyyy-MM-dd HH:mm:ss", new Date());
  return date.getTime();
}

export function trimTs(ts: number, _by: "date") {
  return startOfDay(ts).getTime();
}
