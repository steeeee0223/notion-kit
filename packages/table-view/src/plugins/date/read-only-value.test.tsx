import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { DateConfig } from "@notion-kit/table-hook/plugins";

import {
  renderReadOnlyValue,
  snapshot,
} from "@/edit-log/__tests__/render-read-only-value";

const config: DateConfig = {
  dateFormat: "yyyy/MM/dd",
  timeFormat: "24-hour",
  tz: "Asia/Taipei",
};
const start = Date.UTC(2025, 0, 15, 13, 45);

describe("ReadOnlyDateValue", () => {
  it("TestReadOnlyDate_RangeSnapshot_PreservesHistoricalFormatAndTimezone", () => {
    renderReadOnlyValue(
      snapshot(
        "date",
        { start, end: start + 86_400_000, includeTime: true, endDate: true },
        config,
      ),
    );
    expect(
      screen.getByText("2025/01/15 21:45 → 2025/01/16 21:45"),
    ).toBeVisible();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });

  it.each(["created-time", "last-edited-time"])(
    "TestReadOnlyDate_%s_UsesResolvedHistoricalTimestamp",
    (type) => {
      renderReadOnlyValue(snapshot(type, start, config));
      expect(screen.getByText("2025/01/15 21:45")).toBeVisible();
    },
  );

  it("TestReadOnlyDate_TimeDisabled_OmitsTime", () => {
    renderReadOnlyValue(
      snapshot("date", { start, includeTime: false }, config),
    );
    expect(screen.getByText("2025/01/15")).toBeVisible();
  });

  it("TestReadOnlyDate_EmptyDate_RendersEmpty", () => {
    renderReadOnlyValue(snapshot("date", {}, config));
    expect(screen.getByText("Empty")).toBeVisible();
  });

  it.each([
    ["date", { start: NaN }, config],
    ["date", { start: Infinity }, config],
    ["date", { start: 9e15 }, config],
    ["date", { start: "2025-01-15" }, config],
    ["date", { start, end: NaN }, config],
    ["date", { start }, { ...config, tz: "Invalid/Timezone" }],
    ["date", { start }, { ...config, dateFormat: "invalid" }],
    ["date", { start }, undefined],
    ["created-time", { start }, config],
    ["last-edited-time", null, config],
  ])("TestReadOnlyDate_%sInvalidSnapshot_FallsBack", (type, value, config) => {
    renderReadOnlyValue(snapshot(type, value, config));
    expect(screen.getByText("Historical fallback")).toBeVisible();
  });
});
