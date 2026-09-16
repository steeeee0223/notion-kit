import { expect, it } from "vitest";

import { layoutDayEvents, monthDays } from "../month-layout";

const ts = (date: string) => Date.parse(`${date}T00:00Z`);
it.each([
  ["2021-02-15", 28],
  ["2026-09-16", 35],
  ["2026-08-16", 42],
  ["2024-02-16", 35],
] as const)(
  "CalendarMonth_%s_CompletesTheMonthInWholeWeeks",
  (date, length) => {
    const days = monthDays(ts(date), "UTC", 1);
    expect(days).toHaveLength(length);
    expect(new Date(days[0]!).getUTCDay()).toBe(1);
    expect(new Date(days.at(-1)!).getUTCDay()).toBe(0);
  },
);
it("CalendarMonth_CrossWeekOverlaps_PreservesOffsetsAndOnlyRealResizeBoundaries", () => {
  const days = monthDays(ts("2026-09-16"), "UTC", 1);
  const events = [
    {
      id: "long",
      name: "Long",
      startAt: ts("2026-09-05"),
      endAt: ts("2026-09-09"),
      allDay: true,
    },
    {
      id: "short",
      name: "Short",
      startAt: ts("2026-09-05"),
      endAt: ts("2026-09-07"),
      allDay: true,
    },
  ];
  const rows = layoutDayEvents(events, days, "UTC", 7);
  expect(
    rows[0]!.segments.map((s) => [
      s.event.id,
      s.column,
      s.span,
      s.lane,
      s.isStart,
      s.isEnd,
      s.dayOffset,
    ]),
  ).toEqual([
    ["long", 5, 2, 0, true, false, 0],
    ["short", 5, 2, 1, true, true, 0],
  ]);
  expect(
    rows[1]!.segments.map((s) => [
      s.event.id,
      s.column,
      s.span,
      s.isStart,
      s.isEnd,
      s.dayOffset,
    ]),
  ).toEqual([["long", 0, 2, false, true, 2]]);
  expect(layoutDayEvents(events, days, "UTC", 7)).toEqual(rows);
});
