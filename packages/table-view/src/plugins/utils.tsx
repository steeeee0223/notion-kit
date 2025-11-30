import type { GroupingValueProps } from "./types";

export function DefaultGroupingValue({ value }: GroupingValueProps) {
  if (typeof value === "string")
    return <span className="truncate">{value || "(Empty)"}</span>;
  return <span className="truncate">{value}</span>;
}
