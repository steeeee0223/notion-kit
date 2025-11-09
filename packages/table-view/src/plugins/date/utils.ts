import { formatDate } from "@notion-kit/utils";

import { DateConfig, DateData } from "./types";

export function toDateString(data: DateData, config: DateConfig) {
  if (data.start === undefined) return "";
  const startStr = formatDate(data.start, config.dateFormat);
  if (data.end === undefined) return startStr;
  const endStr = formatDate(data.end, config.dateFormat);
  return `${startStr} → ${endStr}`;
}
