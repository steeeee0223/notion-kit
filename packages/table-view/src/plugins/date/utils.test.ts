import { describe, expect, it } from "vitest";

import { formatDate } from "@notion-kit/utils";

import { calendarDateToTs, toDateString } from "./utils";

describe("calendarDateToTs", () => {
  it("CalendarSelection_ConfiguredTimezone_PreservesSelectedCalendarDay", () => {
    const selected = new Date(2025, 0, 15);
    const timestamp = calendarDateToTs(selected, {
      dateFormat: "full",
      timeFormat: "24-hour",
      tz: "America/Los_Angeles",
    });

    expect(
      formatDate(timestamp, {
        dateFormat: "_edit_mode",
        timeFormat: "hidden",
        tz: "America/Los_Angeles",
      }),
    ).toBe("2025-01-15");
  });

  it("CalendarSelection_PreviousTime_PreservesTimeInConfiguredTimezone", () => {
    const previous = Date.UTC(2025, 0, 1, 13, 45);
    const timestamp = calendarDateToTs(
      new Date(2025, 0, 15),
      {
        dateFormat: "full",
        timeFormat: "24-hour",
        tz: "UTC",
      },
      previous,
    );

    expect(
      formatDate(timestamp, {
        dateFormat: "_edit_mode",
        timeFormat: "_edit_mode",
        tz: "UTC",
      }),
    ).toBe("2025-01-15 13:45:00");
  });
});

describe("toDateString", () => {
  const config = {
    dateFormat: "full" as const,
    timeFormat: "24-hour" as const,
    tz: "UTC",
  };

  it("DateText_EmptyStart_ReturnsEmptyString", () => {
    expect(toDateString({}, config)).toBe("");
  });

  it("DateText_StartOnly_HidesTimeUnlessRequested", () => {
    const start = Date.UTC(2025, 0, 15, 13, 45);
    expect(toDateString({ start }, config)).toBe("January 15, 2025");
    expect(toDateString({ start, includeTime: true }, config)).toBe(
      "January 15, 2025 13:45",
    );
  });

  it("DateText_Range_FormatsBothBoundaries", () => {
    expect(
      toDateString(
        {
          start: Date.UTC(2025, 0, 15),
          end: Date.UTC(2025, 0, 16),
        },
        config,
      ),
    ).toBe("January 15, 2025 → January 16, 2025");
  });
});
