import { TZDate } from "@date-fns/tz";
import { z } from "zod";

import type { Cell, Row, RowInstance } from "@notion-kit/table-hook";
import type { DateData, DatePlugin } from "@notion-kit/table-hook/plugins";
import type {
  CalendarEventData,
  CalendarEventValue,
} from "@notion-kit/ui/calendar";

const timestampSchema = z.number().finite().min(-8.64e15).max(8.64e15);
const dateSchema = z.object({
  start: timestampSchema,
  end: z.unknown().optional(),
  endDate: z.boolean().optional(),
  includeTime: z.boolean().optional(),
});

function dayBoundary(timestamp: number, timeZone: string, offset = 0) {
  const date = new TZDate(timestamp, timeZone);
  date.setHours(0, 0, 0, 0);
  if (offset) date.setDate(date.getDate() + offset);
  return date.getTime();
}

export function toCalendarEvent(
  row: Row,
  propertyId: string,
  name: string,
  timeZone: string,
): CalendarEventData | null {
  const parsed = dateSchema.safeParse(row.properties[propertyId]?.value);
  if (!parsed.success) return null;
  const value = parsed.data;
  const hasEnd =
    value.endDate !== false &&
    (value.endDate === true || value.end !== undefined);
  const end = hasEnd ? timestampSchema.safeParse(value.end) : null;
  if (end && (!end.success || end.data < value.start)) return null;
  const allDay = !value.includeTime;
  return {
    id: row.id,
    name,
    allDay,
    startAt: allDay ? dayBoundary(value.start, timeZone) : value.start,
    endAt: end?.success
      ? allDay
        ? dayBoundary(end.data, timeZone, 1)
        : end.data
      : null,
  };
}

export function calendarValueToDate(
  value: CalendarEventValue,
  timeZone: string,
): DateData {
  return {
    start: value.allDay ? dayBoundary(value.startAt, timeZone) : value.startAt,
    end:
      value.endAt === null
        ? undefined
        : value.allDay
          ? dayBoundary(value.endAt, timeZone, -1)
          : value.endAt,
    endDate: value.endAt !== null,
    includeTime: !value.allDay,
  };
}

export function createCalendarCellUpdater(
  value: CalendarEventValue,
  timeZone: string,
) {
  return (cell: Cell<DatePlugin>): Cell<DatePlugin> => ({
    ...cell,
    value: { ...cell.value, ...calendarValueToDate(value, timeZone) },
  });
}

/** Traverse the pre-expanded sorted model so collapsed groups keep their rows. */
export function getCalendarRows(rows: RowInstance[]): RowInstance[] {
  return rows.flatMap((row) =>
    row.getIsGrouped() ? getCalendarRows(row.subRows) : [row],
  );
}
