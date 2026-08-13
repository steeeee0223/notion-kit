import { afterEach, describe, expect, it, vi } from "vitest";

import { formatDate } from "@notion-kit/utils";

import {
  calendarDateToTs,
  formatDateGroupingLabel,
  formatDateRangeDuration,
  toDateString,
} from "./utils";

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

describe("date calculation and grouping presentation", () => {
  afterEach(() => vi.useRealTimers());

  const newYork = {
    dateFormat: "full" as const,
    timeFormat: "24-hour" as const,
    tz: "America/New_York",
  };

  it("formats calendar and elapsed ranges correctly across DST fall-back", () => {
    expect(
      formatDateRangeDuration(
        {
          start: Date.parse("2025-11-01T16:00:00Z"),
          end: Date.parse("2025-11-03T17:00:00Z"),
        },
        newYork,
      ),
    ).toBe("2 days");
    expect(
      formatDateRangeDuration(
        {
          start: Date.parse("2025-11-02T04:30:00Z"),
          end: Date.parse("2025-11-02T07:00:00Z"),
          includeTime: true,
        },
        newYork,
      ),
    ).toBe("2 hours 30 minutes");
    expect(formatDateRangeDuration({}, newYork)).toBe("");
    expect(
      formatDateRangeDuration(
        {
          start: Date.parse("2025-11-02T04:30:00Z"),
          end: Date.parse("2025-11-02T04:30:30Z"),
          includeTime: true,
        },
        newYork,
      ),
    ).toBe("0 minutes");
  });

  it("formats non-relative grouping keys through the selected method", () => {
    expect(formatDateGroupingLabel("2025-01-06", "day", newYork)).toBe(
      "January 6, 2025",
    );
    expect(formatDateGroupingLabel("2025-01", "month", newYork)).toBe(
      "January 2025",
    );
    expect(formatDateGroupingLabel("2025-01-06", "week", newYork)).toBe(
      "Week of January 6, 2025",
    );
    expect(formatDateGroupingLabel("2025", "year", newYork)).toBe("2025");
    expect(formatDateGroupingLabel("today", "relative", newYork)).toBe("Today");
    expect(formatDateGroupingLabel("custom", "relative", newYork)).toBe(
      "custom",
    );
  });

  it("uses the configured timezone for relative grouping labels", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-01-01T01:00:00Z"));

    expect(
      formatDateGroupingLabel("2025-01-01", "day", {
        ...newYork,
        dateFormat: "relative",
        tz: "America/Los_Angeles",
      }),
    ).toBe("Tomorrow");
  });
});
