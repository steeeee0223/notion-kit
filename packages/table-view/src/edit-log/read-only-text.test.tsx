import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import {
  renderReadOnlyValue,
  snapshot,
} from "./__tests__/render-read-only-value";

describe.each(["text", "title"])("%s historical value", (type) => {
  it("TestReadOnlyText_MultilineSnapshot_RendersWrappedTextWithoutEditor", async () => {
    const user = userEvent.setup();
    renderReadOnlyValue(
      snapshot(
        type,
        "Old first line\nOld second line",
        type === "title" ? {} : undefined,
      ),
    );
    const value = screen.getByText("Old first line Old second line");
    expect(value).toHaveTextContent("Old first line Old second line");
    expect(value.closest(".whitespace-pre-wrap")).not.toBeNull();
    await user.click(value);
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it.each(["", "   "])("TestReadOnlyText_EmptyValue_RendersEmpty", (value) => {
    renderReadOnlyValue(
      snapshot(type, value, type === "title" ? {} : undefined),
    );
    expect(screen.getByText("Empty")).toBeVisible();
  });

  it("TestReadOnlyText_InvalidValue_FallsBackToHistoricalText", () => {
    renderReadOnlyValue(snapshot(type, { text: "unsupported" }));
    expect(screen.getByText("Historical fallback")).toBeVisible();
  });

  it("TestReadOnlyText_InvalidConfig_FallsBackToHistoricalText", () => {
    renderReadOnlyValue(
      snapshot(type, "Original text", { showIcon: "invalid" }),
    );
    expect(screen.getByText("Historical fallback")).toBeVisible();
  });
});
