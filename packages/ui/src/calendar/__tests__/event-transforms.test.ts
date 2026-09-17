import { expect, it } from "vitest";

import { transformEvent } from "../event-transforms";

const ts = (date: string) => Date.parse(date);
const event = {
  id: "event",
  name: "Event",
  startAt: ts("2026-09-16T10:00Z"),
  endAt: ts("2026-09-16T11:00Z"),
  allDay: false,
};
it("CalendarMove_ContinuationSegmentAndNullEnd_PreservesOriginalOffsetAndOpenEnd", () => {
  expect(
    transformEvent(
      { ...event, endAt: null },
      { day: ts("2026-09-21T00:00Z"), minute: 720, area: "time" },
      "move",
      2,
      "UTC",
    ),
  ).toMatchObject({
    startAt: ts("2026-09-19T12:00Z"),
    endAt: null,
    reason: "move",
  });
});
it.each([
  ["resize-start", "2026-09-16T10:45Z", "2026-09-16T11:00Z"],
  ["resize-end", "2026-09-16T10:00Z", "2026-09-16T10:15Z"],
] as const)(
  "CalendarResize_%s_ClampsToFifteenMinutes",
  (reason, start, end) => {
    const value = transformEvent(
      event,
      {
        day: ts("2026-09-16T00:00Z"),
        minute: reason === "resize-start" ? 720 : 540,
        area: "time",
      },
      reason,
      0,
      "UTC",
    );
    expect(value).toMatchObject({ startAt: ts(start), endAt: ts(end), reason });
  },
);
it("CalendarConversion_ThreeAllDayDatesAndMidnightEnd_PreservesOccupiedDateSpan", () => {
  expect(
    transformEvent(
      {
        ...event,
        startAt: ts("2026-09-16T00:00Z"),
        endAt: ts("2026-09-19T00:00Z"),
        allDay: true,
      },
      { day: ts("2026-09-20T00:00Z"), minute: 600, area: "time" },
      "move",
      0,
      "UTC",
    ),
  ).toMatchObject({
    startAt: ts("2026-09-20T10:00Z"),
    endAt: ts("2026-09-22T11:00Z"),
    allDay: false,
    reason: "convert",
  });
  expect(
    transformEvent(
      { ...event, endAt: ts("2026-09-17T00:00Z") },
      { day: ts("2026-09-20T00:00Z"), area: "all-day" },
      "move",
      0,
      "UTC",
    ),
  ).toMatchObject({
    startAt: ts("2026-09-20T00:00Z"),
    endAt: ts("2026-09-21T00:00Z"),
    allDay: true,
    reason: "convert",
  });
});
it("CalendarMove_AcrossDST_PreservesLocalStartAndActualTimedDuration", () => {
  const value = transformEvent(
    {
      ...event,
      startAt: ts("2026-03-07T15:00Z"),
      endAt: ts("2026-03-07T17:00Z"),
    },
    { day: ts("2026-03-08T05:00Z"), area: "month" },
    "move",
    0,
    "America/New_York",
  );
  expect(value).toMatchObject({
    startAt: ts("2026-03-08T14:00Z"),
    endAt: ts("2026-03-08T16:00Z"),
  });
});
it("CalendarResize_OpenEndedStart_CreatesAnEndAtTheOriginalVisualBoundary", () => {
  expect(
    transformEvent(
      { ...event, endAt: null },
      { day: ts("2026-09-16T00:00Z"), minute: 615, area: "time" },
      "resize-start",
      0,
      "UTC",
    ),
  ).toMatchObject({
    startAt: ts("2026-09-16T10:15Z"),
    endAt: ts("2026-09-16T11:00Z"),
  });
});
it("CalendarMove_MonthEventWithSubminuteTime_PreservesItsExactLocalClock", () => {
  const start = ts("2026-03-07T15:00:45.750Z");
  expect(
    transformEvent(
      { ...event, startAt: start, endAt: start + 3600000 },
      { day: ts("2026-03-08T05:00Z"), area: "month" },
      "move",
      0,
      "America/New_York",
    ),
  ).toMatchObject({
    startAt: ts("2026-03-08T14:00:45.750Z"),
    endAt: ts("2026-03-08T15:00:45.750Z"),
  });
});
it("CalendarResize_MidnightEndInMonth_PreservesTheExclusiveBoundaryAfterTheTargetDate", () => {
  expect(
    transformEvent(
      { ...event, endAt: ts("2026-09-17T00:00Z") },
      { day: ts("2026-09-18T00:00Z"), area: "month" },
      "resize-end",
      0,
      "UTC",
    ),
  ).toMatchObject({ startAt: event.startAt, endAt: ts("2026-09-19T00:00Z") });
});
