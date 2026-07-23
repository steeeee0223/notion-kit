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
