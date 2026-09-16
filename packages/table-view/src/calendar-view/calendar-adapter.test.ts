import { describe, expect, it } from "vitest";

import type { Cell, Row } from "@notion-kit/table-hook";
import type { DatePlugin } from "@notion-kit/table-hook/plugins";

import { createCalendarCellUpdater, toCalendarEvent } from "./calendar-adapter";

const timestamp = (value: string) => Date.parse(value);
const row = (value: unknown): Row =>
  ({
    id: "row-1",
    createdAt: 0,
    lastEditedAt: 0,
    properties: { due: { id: "date-cell", value } },
  }) as Row;

describe("Calendar date adapter", () => {
  it.each([
    ["single date", { start: 0 }, { startAt: 0, endAt: null, allDay: true }],
    [
      "disabled stale end",
      { start: 0, end: -1, endDate: false },
      { startAt: 0, endAt: null, allDay: true },
    ],
    [
      "legacy inclusive end",
      { start: 0, end: 86400000 },
      { startAt: 0, endAt: 172800000, allDay: true },
    ],
    [
      "timed equal boundary",
      { start: 0, end: 0, includeTime: true },
      { startAt: 0, endAt: 0, allDay: false },
    ],
    [
      "timed open end",
      { start: 1, includeTime: true },
      { startAt: 1, endAt: null, allDay: false },
    ],
  ])(
    "ToCalendarEvent_%s_PreservesDateSemantics",
    (_scenario, value, expected) => {
      const source = row(value);
      expect(toCalendarEvent(source, "due", "Task", "UTC")).toEqual({
        id: "row-1",
        name: "Task",
        ...expected,
      });
      expect(source.properties.due?.value).toEqual(value);
    },
  );

  it.each([
    null,
    {},
    { start: "2026-09-16" },
    { start: Number.NaN },
    { start: 9e15 },
    { start: 10, end: 5 },
    { start: 0, end: Number.POSITIVE_INFINITY },
    { start: 0, endDate: true },
    { start: 0, includeTime: "true" },
  ])("ToCalendarEvent_InvalidDate_%jDoesNotProduceAnEvent", (value) => {
    expect(toCalendarEvent(row(value), "due", "Task", "UTC")).toBeNull();
  });

  it("CalendarAllDay_InclusiveEndAcrossSpringDST_RoundTripsLocalDates", () => {
    const start = timestamp("2026-03-07T17:00:00-05:00");
    const end = timestamp("2026-03-08T17:00:00-04:00");
    const event = toCalendarEvent(
      row({ start, end, endDate: true }),
      "due",
      "Task",
      "America/New_York",
    );
    expect(event).toEqual({
      id: "row-1",
      name: "Task",
      allDay: true,
      startAt: timestamp("2026-03-07T00:00:00-05:00"),
      endAt: timestamp("2026-03-09T00:00:00-04:00"),
    });
    const cell = {
      id: "date-cell",
      value: { start, end, endDate: true, custom: "keep" },
    };
    expect(createCalendarCellUpdater(event!, "America/New_York")(cell)).toEqual(
      {
        id: "date-cell",
        value: {
          custom: "keep",
          start: timestamp("2026-03-07T00:00:00-05:00"),
          end: timestamp("2026-03-08T00:00:00-05:00"),
          endDate: true,
          includeTime: false,
        },
      },
    );
  });

  it("CalendarWrite_OpenTimedMove_PreservesCellAndRemovesStaleEnd", () => {
    const cell = {
      id: "date-cell",
      value: { start: 0, end: 10, endDate: false, includeTime: true },
    } satisfies Cell<DatePlugin>;
    expect(
      createCalendarCellUpdater(
        { startAt: 100, endAt: null, allDay: false },
        "UTC",
      )(cell),
    ).toEqual({
      id: "date-cell",
      value: { start: 100, end: undefined, endDate: false, includeTime: true },
    });
    expect(cell.value.start).toBe(0);
  });
});
