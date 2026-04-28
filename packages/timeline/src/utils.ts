import {
  addDays,
  addMonths,
  addQuarters,
  addYears,
  differenceInCalendarDays,
  differenceInDays,
  differenceInHours,
  differenceInMonths,
  differenceInQuarters,
  endOfDay,
  endOfMonth,
  endOfQuarter,
  format,
  getDaysInMonth,
  getMonth,
  isToday,
  startOfDay,
  startOfMonth,
  startOfQuarter,
  startOfYear,
} from "date-fns";

import { COLUMN_WIDTH } from "./constants";
import type {
  TimelineContextProps,
  TimelineData,
  TimelineRange,
  TimelineRangeItem,
  TimelineSubRangeItem,
} from "./types";

export const DEFAULT_START_DATE = new Date(1970, 0, 1);
export const DEFAULT_END_DATE = new Date(2099, 11, 31);

export function noop() {
  // noop
}

const CELL_WIDTHS: Record<TimelineRange, number> = {
  daily: 40,
  monthly: 40,
  quarterly: 40,
};

function dateToPixel(date: Date, range: TimelineRange, origin: Date) {
  const dayOffset = differenceInCalendarDays(date, origin);
  return dayOffset * CELL_WIDTHS[range];
}

function getDaysInQuarter(ts: number | Date) {
  const start = startOfQuarter(ts);
  const end = endOfQuarter(ts);
  return differenceInCalendarDays(end, start) + 1;
}

function generateDailyRanges(
  startTs: Date,
  endTs: Date,
  origin: Date,
): TimelineRangeItem[] {
  const ranges: TimelineRangeItem[] = [];
  let current = startOfMonth(startTs);

  while (current <= endTs) {
    ranges.push({
      label: format(current, "MMMM yyyy"),
      start: dateToPixel(current, "daily", origin),
    });
    current = startOfMonth(addDays(current, getDaysInMonth(current)));
  }

  return ranges;
}

function generateDailySubRanges(startTs: Date, endTs: Date, origin: Date) {
  const items: TimelineSubRangeItem[] = [];
  let current = startOfDay(startTs);

  while (current <= endTs) {
    items.push({
      label: format(current, "d"),
      start: dateToPixel(current, "daily", origin),
      isToday: isToday(current),
    });
    current = addDays(current, 1);
  }

  return items;
}

function generateMonthlyRanges(startTs: Date, endTs: Date, origin: Date) {
  const ranges: TimelineRangeItem[] = [];
  let current = startOfYear(startTs);

  while (current <= endTs) {
    ranges.push({
      label: format(current, "yyyy"),
      start: dateToPixel(current, "monthly", origin),
    });
    current = addYears(current, 1);
  }

  return ranges;
}

function generateMonthlySubRanges(startTs: Date, endTs: Date, origin: Date) {
  const items: TimelineSubRangeItem[] = [];
  let current = startOfMonth(startTs);

  while (current <= endTs) {
    items.push({
      label: format(current, "MMM"),
      start: dateToPixel(current, "monthly", origin),
      isToday: isToday(current),
    });
    current = addMonths(current, 1);
  }

  return items;
}

function generateQuarterlyRanges(startTs: Date, endTs: Date, origin: Date) {
  const ranges: TimelineRangeItem[] = [];
  let current = startOfYear(startTs);

  while (current <= endTs) {
    ranges.push({
      label: format(current, "yyyy"),
      start: dateToPixel(current, "quarterly", origin),
    });
    current = addYears(current, 1);
  }

  return ranges;
}

function generateQuarterlySubRanges(startTs: Date, endTs: Date, origin: Date) {
  const items: TimelineSubRangeItem[] = [];
  let current = startOfQuarter(startTs);

  while (current <= endTs) {
    items.push({
      label: `Q${Math.floor(getMonth(current) / 3) + 1}`,
      start: dateToPixel(current, "quarterly", origin),
      isToday: isToday(current), // not really today, but matches interface
    });
    current = addQuarters(current, 1);
  }

  return items;
}

export function createTimelineData(
  range: TimelineRange,
  startTs?: number | null,
  endTs?: number | null,
): TimelineData {
  const start = startTs ? new Date(startTs) : DEFAULT_START_DATE;
  const end = endTs ? new Date(endTs) : DEFAULT_END_DATE;
  switch (range) {
    case "daily":
      return {
        start,
        end,
        ranges: generateDailyRanges(start, end, start),
        subRanges: generateDailySubRanges(start, end, start),
      };
    case "monthly":
      return {
        start,
        end,
        ranges: generateMonthlyRanges(start, end, start),
        subRanges: generateMonthlySubRanges(start, end, start),
      };
    case "quarterly":
      return {
        start,
        end,
        ranges: generateQuarterlyRanges(start, end, start),
        subRanges: generateQuarterlySubRanges(start, end, start),
      };
    default:
      return { start, end, ranges: [], subRanges: [] };
  }
}

export const differenceInFn = {
  daily: differenceInDays,
  monthly: differenceInMonths,
  quarterly: differenceInQuarters,
};

export const innerDifferenceInFn = {
  daily: differenceInHours,
  monthly: differenceInDays,
  quarterly: differenceInDays,
};

export const startOfFn = {
  daily: startOfDay,
  monthly: startOfMonth,
  quarterly: startOfQuarter,
};

export const daysInFn = {
  daily: (_ts: number | Date) => 1,
  monthly: getDaysInMonth,
  quarterly: getDaysInQuarter,
};

export const endOfFn = {
  daily: endOfDay,
  monthly: endOfMonth,
  quarterly: endOfQuarter,
};

export const addRangeFn = {
  daily: addDays,
  monthly: addMonths,
  quarterly: addQuarters,
};

export function resolveColumnWidth(range: TimelineRange, zoom: number) {
  return (zoom / 100) * COLUMN_WIDTH[range];
}

export function snapDays(days: number, range: TimelineRange) {
  if (range === "quarterly") return Math.round(days / 7) * 7;
  return days;
}

export function getOffset(
  ts: number | Date,
  ctx: Pick<TimelineContextProps, "range" | "zoom" | "timelineData">,
) {
  const columnWidth = resolveColumnWidth(ctx.range, ctx.zoom);
  const differenceIn = differenceInFn[ctx.range];
  const startOf = startOfFn[ctx.range];
  const fullColumns = differenceIn(startOf(ts), ctx.timelineData.start);

  if (ctx.range === "daily") {
    return columnWidth * fullColumns;
  }

  const rangeStart = startOf(ts);
  const partialDays = snapDays(
    differenceInCalendarDays(ts, rangeStart),
    ctx.range,
  );
  const totalDays = daysInFn[ctx.range](ts);
  const pixelsPerDay = columnWidth / totalDays;

  return fullColumns * columnWidth + partialDays * pixelsPerDay;
}

export function getDateByMousePosition(
  ctx: TimelineContextProps,
  mouseX: number,
) {
  const timelineStartTs = ctx.timelineData.start;
  const columnWidth = resolveColumnWidth(ctx.range, ctx.zoom);
  const offset = Math.floor(mouseX / columnWidth);
  const daysIn = daysInFn[ctx.range];
  const addRange = addRangeFn[ctx.range];
  const month = addRange(timelineStartTs, offset);
  const daysInMonth = daysIn(month);
  const pixelsPerDay = Math.round(columnWidth / daysInMonth);
  const dayOffset = Math.floor((mouseX % columnWidth) / pixelsPerDay);
  const actualDate = addDays(month, dayOffset);

  return actualDate;
}
