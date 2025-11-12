import { formatDate } from "@notion-kit/utils";

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
