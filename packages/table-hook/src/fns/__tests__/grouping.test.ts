import { describe, expect, it } from "vitest";

import {
  dateGroupSortValue,
  groupByDateDay,
  groupByDateMonth,
  groupByDateRelative,
  groupByDateWeek,
  groupByDateYear,
  groupByNumberInterval,
  groupByTextAlphabetical,
  groupByTextExact,
  groupByTextValue,
  groupByValue,
} from "@/fns";

describe("common grouping functions", () => {
  it("preserves neutral primitive grouping values", () => {
    expect(groupByValue("Alpha")).toBe("Alpha");
    expect(groupByValue(0)).toBe(0);
    expect(groupByValue(false)).toBe(false);
    expect(groupByValue(null)).toBeNull();
  });

  it("normalizes text-compatible values and empties without UI dependencies", () => {
    expect(groupByTextValue("Alpha")).toBe("Alpha");
    expect(groupByTextValue(0)).toBe("0");
    expect(groupByTextValue(true)).toBe("true");
    expect(groupByTextValue(false)).toBe("");
    expect(groupByTextValue(undefined)).toBe("");
    expect(groupByValue({ name: "Alpha" })).toBeNull();
  });

  it("groups exact and alphabetical text while treating whitespace as empty", () => {
    expect(groupByTextExact(" Apple ")).toBe(" Apple ");
    expect(groupByTextExact("  \n ")).toBe("");
    expect(groupByTextAlphabetical(" apple")).toBe("A");
    expect(groupByTextAlphabetical("Apricot")).toBe("A");
    expect(groupByTextAlphabetical(" 7zip")).toBe("7");
    expect(groupByTextAlphabetical(" #tag")).toBe("#");
  });

  it.each([1, 10, 100, 1000])(
    "uses floor-based half-open number buckets of %i",
    (interval) => {
      expect(groupByNumberInterval(0, interval)).toBe(0);
      expect(groupByNumberInterval(interval - 0.01, interval)).toBe(0);
      expect(groupByNumberInterval(interval, interval)).toBe(interval);
      expect(groupByNumberInterval(-0.01, interval)).toBe(-interval);
      expect(groupByNumberInterval(-interval, interval)).toBe(-interval);
      expect(groupByNumberInterval("invalid", interval)).toBeNull();
    },
  );

  it("groups zoned date boundaries and honors Sunday or Monday week starts", () => {
    const beforeTaipeiMidnight = Date.parse("2025-01-05T15:59:59.999Z");
    const atTaipeiMidnight = Date.parse("2025-01-05T16:00:00.000Z");

    expect(
      groupByDateDay(beforeTaipeiMidnight, { timeZone: "Asia/Taipei" }),
    ).toBe("2025-01-05");
    expect(groupByDateDay(atTaipeiMidnight, { timeZone: "Asia/Taipei" })).toBe(
      "2025-01-06",
    );
    expect(
      groupByDateWeek(atTaipeiMidnight, {
        timeZone: "Asia/Taipei",
        weekStartsOn: 1,
      }),
    ).toBe("2025-01-06");
    expect(
      groupByDateWeek(atTaipeiMidnight, {
        timeZone: "Asia/Taipei",
        weekStartsOn: 0,
      }),
    ).toBe("2025-01-05");
    expect(
      groupByDateMonth(atTaipeiMidnight, { timeZone: "Asia/Taipei" }),
    ).toBe("2025-01");
    expect(groupByDateYear(atTaipeiMidnight, { timeZone: "Asia/Taipei" })).toBe(
      "2025",
    );
    const beforeNewYear = Date.parse("2025-12-31T15:59:59.999Z");
    const atNewYear = Date.parse("2025-12-31T16:00:00Z");
    expect(
      [beforeNewYear, atNewYear].map((value) =>
        groupByDateMonth(value, { timeZone: "Asia/Taipei" }),
      ),
    ).toEqual(["2025-12", "2026-01"]);
    expect(
      [beforeNewYear, atNewYear].map((value) =>
        groupByDateYear(value, { timeZone: "Asia/Taipei" }),
      ),
    ).toEqual(["2025", "2026"]);
    expect(
      groupByDateDay(
        { start: beforeTaipeiMidnight, end: atTaipeiMidnight },
        { timeZone: "Asia/Taipei" },
      ),
    ).toBe("2025-01-05");
  });

  it("keeps relative day precedence across a New York DST week", () => {
    const options = {
      timeZone: "America/New_York",
      now: Date.parse("2025-03-09T16:00:00Z"),
      weekStartsOn: 1 as const,
    };

    expect(
      groupByDateRelative(Date.parse("2025-03-09T06:30:00Z"), options),
    ).toBe("today");
    expect(
      groupByDateRelative(Date.parse("2025-03-08T17:00:00Z"), options),
    ).toBe("yesterday");
    expect(
      groupByDateRelative(Date.parse("2025-03-10T16:00:00Z"), options),
    ).toBe("tomorrow");
    expect(
      groupByDateRelative(Date.parse("2025-03-05T17:00:00Z"), options),
    ).toBe("this-week");
    expect(
      groupByDateRelative(Date.parse("2025-02-28T17:00:00Z"), options),
    ).toBe("last-week");
    expect(
      groupByDateRelative(Date.parse("2025-03-12T16:00:00Z"), options),
    ).toBe("next-week");
    expect(
      groupByDateRelative(Date.parse("2025-02-01T17:00:00Z"), options),
    ).toBe("earlier");
    expect(
      groupByDateRelative(Date.parse("2025-04-01T16:00:00Z"), options),
    ).toBe("later");
    expect(dateGroupSortValue("last-week", options)!).toBeLessThan(
      dateGroupSortValue("today", options)!,
    );
    expect(dateGroupSortValue("today", options)!).toBeLessThan(
      dateGroupSortValue("next-week", options)!,
    );
  });
});
