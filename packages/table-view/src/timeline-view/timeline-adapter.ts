import type { Cell, ColumnInfo, Row } from "@notion-kit/table-hook";
import type { TimelineFeature } from "@notion-kit/ui/timeline";

import type { DateData, DatePlugin } from "@/plugins";

export function isUsableTimelineDateProperty(property: ColumnInfo) {
  return property.type === "date" && !property.hidden && !property.isDeleted;
}

export function resolveTimelineDateProperty(
  properties: ColumnInfo[],
  persistedId: string | null,
) {
  const persisted = properties.find(
    (property) =>
      property.id === persistedId && isUsableTimelineDateProperty(property),
  );
  return persisted ?? properties.find(isUsableTimelineDateProperty) ?? null;
}

function addCalendarDay(timestamp: number) {
  const date = new Date(timestamp);
  date.setDate(date.getDate() + 1);
  return date.getTime();
}

export function toTimelineFeature(
  row: Row,
  propertyId: string,
  name: string,
): TimelineFeature | null {
  const value: unknown = row.properties[propertyId]?.value;
  if (!value || typeof value !== "object") return null;

  const { start, end } = value as DateData;
  if (!Number.isFinite(start)) return null;
  if (end !== undefined && (!Number.isFinite(end) || end < start!)) {
    return null;
  }

  return {
    id: row.id,
    name,
    startAt: start!,
    endAt: end ?? addCalendarDay(start!),
  };
}

export function createInitialTimelineDate(row: Row): DateData {
  return {
    start: row.createdAt,
    end: Math.max(row.createdAt, row.lastEditedAt),
    endDate: true,
  };
}

export function createEmptyTrackDate(start: number): DateData {
  return { start, end: addCalendarDay(start), endDate: true };
}

export function createTimelineCellUpdater(start: number, end: number) {
  return (cell: Cell<DatePlugin>): Cell<DatePlugin> => ({
    ...cell,
    value: { ...cell.value, start, end, endDate: true },
  });
}
