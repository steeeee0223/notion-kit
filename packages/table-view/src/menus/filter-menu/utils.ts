import type { FilterRule, FilterValue } from "@notion-kit/table-hook";
import { isoToTs } from "@notion-kit/utils";

export function getOptionNames(config: unknown): string[] {
  if (typeof config !== "object" || config === null) return [];
  const options = (config as { options?: unknown }).options;
  if (typeof options !== "object" || options === null) return [];
  const names = (options as { names?: unknown }).names;
  return Array.isArray(names) && names.every((name) => typeof name === "string")
    ? names
    : [];
}

export function getRecordNumber(value: FilterValue | undefined, key: string) {
  if (typeof value !== "object" || value === null || Array.isArray(value))
    return undefined;
  const candidate = value[key];
  return typeof candidate === "number" && Number.isFinite(candidate)
    ? candidate
    : undefined;
}

export function omitRuleValue(rule: FilterRule): FilterRule {
  const { value: _value, ...withoutValue } = rule;
  return withoutValue;
}

export function getTimeZone(config: unknown) {
  if (typeof config !== "object" || config === null) return "UTC";
  const timeZone = (config as { tz?: unknown }).tz;
  return typeof timeZone === "string" ? timeZone : "UTC";
}

export function parseDate(value: string, timeZone: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
  const timestamp = isoToTs({ date: value, time: "00:00:00" }, timeZone);
  if (
    !Number.isFinite(timestamp) ||
    formatDateValue(timestamp, timeZone) !== value
  )
    return undefined;
  return timestamp;
}

export function formatDateValue(
  timestamp: number | undefined,
  timeZone: string,
) {
  if (timestamp === undefined) return "";
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(timestamp);
  const getPart = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value;
  const year = getPart("year");
  const month = getPart("month");
  const day = getPart("day");
  return year && month && day ? `${year}-${month}-${day}` : "";
}

export function calendarDateKey(date: Date) {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function dateKeyToCalendarDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
  const [year, month, day] = value.split("-").map(Number);
  if (year === undefined || month === undefined || day === undefined) {
    return undefined;
  }
  return new Date(year, month - 1, day);
}
