import { expect, it } from "vitest";

import { layoutTimedEvents } from "../time-grid-layout";

const ts = (date: string) => Date.parse(date);
it("CalendarTimeGrid_MidnightAndShortEvents_SplitsOnlyOccupiedDaysAndAvoidsVisualOverlap", () => {
  const day = ts("2026-09-16T00:00Z");
  const event = (id: string, start: string, end: string | null) => ({
    id,
    name: id,
    startAt: ts(start),
    endAt: end ? ts(end) : null,
    allDay: false,
  });
  const segments = layoutTimedEvents(
    [
      event("night", "2026-09-15T23:00Z", "2026-09-16T01:00Z"),
      event("midnight", "2026-09-15T22:00Z", "2026-09-16T00:00Z"),
      event("short", "2026-09-16T10:00Z", "2026-09-16T10:01Z"),
      event("nearby", "2026-09-16T10:05Z", "2026-09-16T10:10Z"),
      event("adjacent", "2026-09-16T10:35Z", "2026-09-16T11:35Z"),
    ],
    [day],
    "UTC",
  );
  expect(segments.map((s) => s.event.id)).toEqual([
    "night",
    "short",
    "nearby",
    "adjacent",
  ]);
  expect(segments[0]).toMatchObject({
    startMinute: 0,
    endMinute: 60,
    isStart: false,
    isEnd: true,
    dayOffset: 1,
  });
  expect(segments[1]).toMatchObject({
    startMinute: 600,
    endMinute: 601,
    columnCount: 2,
  });
  expect(segments[2]).toMatchObject({ columnCount: 2 });
  expect(segments[3]).toMatchObject({ columnCount: 1 });
});
it("CalendarTimeGrid_RepeatedHour_SeparatesVisuallyCoincidentActualIntervals", () => {
  const segments = layoutTimedEvents(
    [
      {
        id: "first",
        name: "first",
        startAt: ts("2026-11-01T05:00Z"),
        endAt: ts("2026-11-01T05:30Z"),
        allDay: false,
      },
      {
        id: "second",
        name: "second",
        startAt: ts("2026-11-01T06:00Z"),
        endAt: ts("2026-11-01T06:30Z"),
        allDay: false,
      },
    ],
    [ts("2026-11-01T04:00Z")],
    "America/New_York",
  );
  expect(segments.map((s) => [s.startMinute, s.column, s.columnCount])).toEqual(
    [
      [60, 0, 2],
      [60, 1, 2],
    ],
  );
});

it("CalendarTimeGrid_NearMidnight_KeepsMinimumHeightAndSeparatesVisualCollisions", () => {
  const segments = layoutTimedEvents(
    [
      {
        id: "earlier",
        name: "Earlier",
        startAt: ts("2026-09-16T23:20Z"),
        endAt: ts("2026-09-16T23:45Z"),
        allDay: false,
      },
      {
        id: "late",
        name: "Late",
        startAt: ts("2026-09-16T23:59Z"),
        endAt: ts("2026-09-16T23:59Z"),
        allDay: false,
      },
    ],
    [ts("2026-09-16T00:00Z")],
    "UTC",
  );
  expect(segments[1]).toMatchObject({
    startMinute: 1439,
    endMinute: 1439,
    visualStart: 1410,
    visualEnd: 1440,
    column: 1,
    columnCount: 2,
  });
  expect(segments[0]).toMatchObject({ column: 0, columnCount: 2 });
});
