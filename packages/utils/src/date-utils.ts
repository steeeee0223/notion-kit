export type DateFormat =
  | "full"
  | "short"
  | "MM/dd/yyyy"
  | "dd/MM/yyyy"
  | "yyyy/MM/dd"
  | "relative";

export function formatDate(ts: number, format: DateFormat): string {
  switch (format) {
    default:
      return new Date(ts).toDateString();
  }
}
