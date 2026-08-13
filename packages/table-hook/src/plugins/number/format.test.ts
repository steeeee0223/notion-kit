import { describe, expect, it } from "vitest";

import { formatNumber } from "./format";
import type { NumberConfig } from "./types";

const baseConfig: NumberConfig = {
  format: "number",
  round: "default",
  showAs: "number",
  options: { color: "green", divideBy: 100, showNumber: true },
};

describe("number presentation formatting", () => {
  it("shares rounding and unit formatting for cells and calculations", () => {
    expect(
      formatNumber(
        1234.567,
        { ...baseConfig, format: "number_with_commas", round: "2" },
        "en-US",
      ),
    ).toBe("1,234.57");
    expect(
      formatNumber(
        12.345,
        { ...baseConfig, format: "percent", round: "1" },
        "en-US",
      ),
    ).toBe("12.3%");
    expect(
      formatNumber(
        -12.5,
        { ...baseConfig, format: "currency", round: "2" },
        "en-US",
      ),
    ).toBe("-$12.50");
  });
});
