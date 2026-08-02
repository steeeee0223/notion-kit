import {
  addDays,
  endOfDay,
  endOfMonth,
  endOfQuarter,
  startOfDay,
  startOfMonth,
  startOfQuarter,
} from "date-fns";
import { describe, expect, it, vi } from "vitest";

import type { TimelineContextProps, TimelineRange } from "../types";
import {
  addRangeFn,
  createTimelineData,
  daysInFn,
  DEFAULT_END_DATE,
  DEFAULT_START_DATE,
  differenceInFn,
  endOfFn,
  getDateByMousePosition,
  getOffset,
  innerDifferenceInFn,
  noop,
  resolveColumnWidth,
  snapDays,
  startOfFn,
} from "../utils";

function createContext(
  range: TimelineRange,
  start: Date,
  zoom = 100,
): TimelineContextProps {
  return {
    range,
    zoom,
    onAddItem: vi.fn(),
    timelineData: createTimelineData(
      range,
      start.getTime(),
      addDays(start, 400).getTime(),
    ),
    ref: { current: null },
    scrollToFeature: vi.fn(),
  };
}

describe("timeline date utilities", () => {
  it.each([
    {
      range: "daily" as const,
      start: new Date(2026, 0, 30),
      end: new Date(2026, 1, 2),
      rangeLabels: ["January 2026", "February 2026"],
      subRangeLabels: ["30", "31", "1", "2"],
    },
    {
      range: "monthly" as const,
      start: new Date(2025, 10, 15),
      end: new Date(2026, 1, 1),
      rangeLabels: ["2025", "2026"],
      subRangeLabels: ["Nov", "Dec", "Jan", "Feb"],
    },
    {
      range: "quarterly" as const,
      start: new Date(2025, 10, 15),
      end: new Date(2026, 3, 1),
      rangeLabels: ["2025", "2026"],
      subRangeLabels: ["Q4", "Q1", "Q2"],
    },
  ])(
    "CreateTimelineData_$rangeRange_GeneratesBoundaryLabelsAndOffsets",
    ({ range, start, end, rangeLabels, subRangeLabels }) => {
      const result = createTimelineData(range, start.getTime(), end.getTime());

      expect(result.start).toEqual(start);
      expect(result.end).toEqual(end);
      expect(result.ranges.map(({ label }) => label)).toEqual(rangeLabels);
      expect(result.subRanges.map(({ label }) => label)).toEqual(
        subRangeLabels,
      );
      expect(result.ranges[0]?.start).toBeLessThanOrEqual(0);
      expect(result.subRanges[0]?.start).toBeLessThanOrEqual(0);
      expect(
        result.subRanges.every(({ isToday }) => typeof isToday === "boolean"),
      ).toBe(true);
    },
  );

  it("CreateTimelineData_MissingBounds_UsesDocumentedDefaults", () => {
    const result = createTimelineData("quarterly", null, undefined);

    expect(result.start).toEqual(DEFAULT_START_DATE);
    expect(result.end).toEqual(DEFAULT_END_DATE);
  });

  it("CreateTimelineData_UnsupportedRange_ReturnsEmptyRanges", () => {
    const result = createTimelineData(
      "unsupported" as TimelineRange,
      new Date(2026, 0, 1).getTime(),
      new Date(2026, 0, 2).getTime(),
    );

    expect(result.ranges).toEqual([]);
    expect(result.subRanges).toEqual([]);
  });

  it.each([
    ["daily" as const, 50],
    ["monthly" as const, 150],
    ["quarterly" as const, 100],
  ])(
    "ResolveColumnWidth_%sRange_ScalesBaseWidthByZoom",
    (range, expectedAtFullZoom) => {
      expect(resolveColumnWidth(range, 100)).toBe(expectedAtFullZoom);
      expect(resolveColumnWidth(range, 50)).toBe(expectedAtFullZoom / 2);
    },
  );

  it("SnapDays_QuarterlyRange_SnapsToNearestWeek", () => {
    expect(snapDays(10, "quarterly")).toBe(7);
    expect(snapDays(11, "quarterly")).toBe(14);
    expect(snapDays(10, "monthly")).toBe(10);
  });

  it("GetOffset_DailyRange_UsesWholeDayColumns", () => {
    const start = new Date(2026, 0, 1);
    const context = createContext("daily", start);

    expect(getOffset(new Date(2026, 0, 4, 23), context)).toBe(150);
  });

  it("GetOffset_MonthlyRange_IncludesPartialMonthProgress", () => {
    const start = new Date(2026, 0, 1);
    const context = createContext("monthly", start);

    expect(getOffset(new Date(2026, 1, 15), context)).toBeCloseTo(
      150 + (14 * 150) / 28,
    );
  });

  it("GetOffset_QuarterlyRange_SnapsPartialProgressToWeeks", () => {
    const start = new Date(2026, 0, 1);
    const context = createContext("quarterly", start);

    expect(getOffset(new Date(2026, 3, 11), context)).toBeCloseTo(
      100 + (7 * 100) / 91,
    );
  });

  it.each([
    ["daily" as const, 125, new Date(2026, 0, 3)],
    ["monthly" as const, 225, new Date(2026, 1, 16)],
    ["quarterly" as const, 150, new Date(2026, 4, 21)],
  ])(
    "GetDateByMousePosition_%sRange_ResolvesColumnAndIntraColumnDate",
    (range, mouseX, expected) => {
      const context = createContext(range, new Date(2026, 0, 1));

      expect(getDateByMousePosition(context, mouseX)).toEqual(expected);
    },
  );

  it("TimelineFunctionMaps_AllRanges_ApplyExpectedCalendarOperations", () => {
    const value = new Date(2026, 1, 15, 12);

    expect(startOfFn.daily(value)).toEqual(startOfDay(value));
    expect(startOfFn.monthly(value)).toEqual(startOfMonth(value));
    expect(startOfFn.quarterly(value)).toEqual(startOfQuarter(value));
    expect(endOfFn.daily(value)).toEqual(endOfDay(value));
    expect(endOfFn.monthly(value)).toEqual(endOfMonth(value));
    expect(endOfFn.quarterly(value)).toEqual(endOfQuarter(value));
    expect(daysInFn.daily(value)).toBe(1);
    expect(daysInFn.monthly(value)).toBe(28);
    expect(daysInFn.quarterly(value)).toBe(90);
    expect(addRangeFn.daily(value, 1)).toEqual(new Date(2026, 1, 16, 12));
    expect(addRangeFn.monthly(value, 1)).toEqual(new Date(2026, 2, 15, 12));
    expect(addRangeFn.quarterly(value, 1)).toEqual(new Date(2026, 4, 15, 12));
    expect(differenceInFn.daily(addDays(value, 2), value)).toBe(2);
    expect(differenceInFn.monthly(new Date(2026, 3, 15, 12), value)).toBe(2);
    expect(differenceInFn.quarterly(new Date(2026, 7, 15, 12), value)).toBe(2);
    expect(innerDifferenceInFn.daily(addDays(value, 1), value)).toBe(24);
    expect(innerDifferenceInFn.monthly(addDays(value, 2), value)).toBe(2);
    expect(innerDifferenceInFn.quarterly(addDays(value, 2), value)).toBe(2);
  });

  it("Noop_Called_HasNoObservableEffect", () => {
    expect(noop()).toBeUndefined();
  });
});
