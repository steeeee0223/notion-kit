import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { NumberConfig } from "@notion-kit/table-hook/plugins";

import {
  renderReadOnlyValue,
  snapshot,
} from "@/edit-log/__tests__/render-read-only-value";

const config: NumberConfig = {
  format: "currency",
  round: "2",
  showAs: "number",
  options: { color: "purple", divideBy: 200, showNumber: true },
};

describe("ReadOnlyNumberValue", () => {
  it("TestReadOnlyNumber_StoredConfig_PreservesFormattingAndRounding", () => {
    renderReadOnlyValue(snapshot("number", "1234.567", config));
    expect(screen.getByText("$1,234.57")).toBeVisible();
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });

  it.each(["number", "bar", "ring"] as const)(
    "TestReadOnlyNumber_%sZero_RemainsVisible",
    (showAs) => {
      renderReadOnlyValue(snapshot("number", "0", { ...config, showAs }));
      expect(screen.getByText("$0.00")).toBeVisible();
      expect(screen.queryByText("Empty")).not.toBeInTheDocument();
      if (showAs !== "number") {
        const meter = screen.getByRole("meter");
        expect(meter).toHaveAttribute("aria-valuenow", "0");
        expect(meter).toHaveAttribute("aria-valuemax", "200");
      }
    },
  );

  it("TestReadOnlyNumber_Null_RendersEmpty", () => {
    renderReadOnlyValue(snapshot("number", null, config));
    expect(screen.getByText("Empty")).toBeVisible();
  });

  it.each([
    ["not a number", config],
    ["Infinity", config],
    ["", config],
    [false, config],
    [0, config],
    ["12", undefined],
    ["12", { ...config, round: "6" }],
    ["12", { ...config, format: "unknown" }],
    ["12", { ...config, options: { ...config.options, color: "unknown" } }],
    [
      "12",
      { ...config, showAs: "bar", options: { ...config.options, divideBy: 0 } },
    ],
  ])("TestReadOnlyNumber_InvalidValueOrConfig_FallsBack", (value, config) => {
    renderReadOnlyValue(snapshot("number", value, config));
    expect(screen.getByText("Historical fallback")).toBeVisible();
  });
});
