import { formatDate, isoToTs } from "@notion-kit/utils";

import { DateConfig, DateData } from "./types";

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
  if (methodId === "relative") return relativeGroupLabels[value] ?? value;
  if (methodId === "year") return value;

  const date = methodId === "month" ? `${value}-01` : value;
  const timestamp = isoToTs({ date, time: "00:00:00" }, config.tz);
  if (methodId === "month") {
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
