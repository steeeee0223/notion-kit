import { expect, it } from "vitest";

import { resolveTimeZone } from "@notion-kit/utils";

import {
  addCalendarDays,
  calendarDay,
  effectiveEnd,
  localTime,
  navigateDate,
  validEvents,
} from "../date-utils";

const ny = "America/New_York";
it("CalendarDates_DSTBoundaries_UseLocalDaysAndCompatibleTimeDisambiguation", () => {
  expect(addCalendarDays(Date.parse("2026-03-08T05:00Z"), 1, ny)).toBe(
    Date.parse("2026-03-09T04:00Z"),
  );
  expect(localTime(Date.parse("2026-03-08T05:00Z"), 150, ny)).toBe(
    Date.parse("2026-03-08T07:30Z"),
  );
  expect(localTime(Date.parse("2026-11-01T04:00Z"), 90, ny)).toBe(
    Date.parse("2026-11-01T05:30Z"),
  );
  expect(calendarDay(Date.parse("2026-09-16T23:00Z"), "Asia/Taipei")).toBe(
    Date.parse("2026-09-16T16:00Z"),
  );
  expect(resolveTimeZone("invalid/timezone")).toBe("UTC");
});
it("CalendarEvents_InvalidSiblingAndOpenEnds_IsolateErrorsWithoutInventingStoredEnds", () => {
  const valid = {
    id: "ok",
    name: "OK",
    startAt: 0,
    endAt: null,
    allDay: false,
  };
  expect(
    validEvents([
      valid,
      { ...valid, id: "bad", startAt: NaN },
      { ...valid, id: "reverse", endAt: -1 },
    ]),
  ).toEqual([valid]);
  expect(effectiveEnd(valid, "UTC")).toBe(3600000);
  expect(
    effectiveEnd(
      { ...valid, allDay: true, startAt: Date.parse("2026-03-08T05:00Z") },
      ny,
    ),
  ).toBe(Date.parse("2026-03-09T04:00Z"));
  expect(valid.endAt).toBeNull();
});
it("CalendarNavigation_MonthEndAndRangeChanges_PreserveLocalTimeAndClampTheDate", () => {
  expect(
    navigateDate(Date.parse("2024-01-31T15:30Z"), "monthly", 1, "UTC"),
  ).toBe(Date.parse("2024-02-29T15:30Z"));
  expect(navigateDate(Date.parse("2026-03-07T15:30Z"), "daily", 1, ny)).toBe(
    Date.parse("2026-03-08T14:30Z"),
  );
});
