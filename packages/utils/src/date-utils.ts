import { differenceInDays, format, formatDistance, startOfDay } from "date-fns";

export type DateFormat =
  | "full" // e.g. November 5, 2025
  | "short" // e.g. Nov 5
  | "MM/dd/yyyy"
  | "dd/MM/yyyy"
  | "yyyy/MM/dd"
  | "relative" // e.g. 3 days ago
  | "_display_mode"; // e.g. Nov 5, 2025

/**
 * Format a timestamp into a date string based on the specified format.
 * @param ts timestamp in ms
 */
export function formatDate(ts: number, dateFormat: DateFormat): string {
  switch (dateFormat) {
    case "full":
      return format(ts, "MMMM d, yyyy");
    case "short":
      return format(ts, "MMM d");
    case "MM/dd/yyyy":
    case "dd/MM/yyyy":
    case "yyyy/MM/dd":
      return format(ts, dateFormat);
    case "relative": {
      const today = startOfDay(new Date());
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
    case "_display_mode":
      return format(ts, "MMM d, yyyy");
    default:
      return new Date(ts).toDateString();
  }
}
