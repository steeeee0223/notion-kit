import { describe, expect, it } from "vitest";

import { formatDate } from "@notion-kit/utils";

import { calendarDateToTs } from "./utils";

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
});
