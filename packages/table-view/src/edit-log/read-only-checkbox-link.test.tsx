import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import {
  renderReadOnlyValue,
  snapshot,
} from "./__tests__/render-read-only-value";

describe("Historical checkbox and links", () => {
  it.each(["checkbox", "email", "phone", "url"])(
    "TestReadOnlyValue_%sInvalidConfig_FallsBack",
    (type) => {
      renderReadOnlyValue(
        snapshot(type, type === "checkbox" ? false : "Original value", {
          unsupported: true,
        }),
      );
      expect(screen.getByText("Historical fallback")).toBeVisible();
    },
  );

  it.each([true, false])(
    "TestReadOnlyCheckbox_%s_RemainsVisibleAndReadOnly",
    async (value) => {
      const user = userEvent.setup();
      renderReadOnlyValue(snapshot("checkbox", value));
      const checkbox = screen.getByRole("checkbox", {
        name: "Historical name",
      });
      expect(checkbox).toHaveAttribute("aria-checked", String(value));
      await user.click(checkbox);
      await user.keyboard(" ");
      expect(checkbox).toHaveAttribute("aria-checked", String(value));
      expect(screen.queryByText("Empty")).not.toBeInTheDocument();
    },
  );

  it("TestReadOnlyCheckbox_InvalidValue_FallsBack", () => {
    renderReadOnlyValue(snapshot("checkbox", "false"));
    expect(screen.getByText("Historical fallback")).toBeVisible();
  });

  it.each([
    ["email", "old@example.com", "mailto:old@example.com"],
    ["phone", "+886900123456", "tel:+886900123456"],
    ["url", "https://old.example.com", "https://old.example.com"],
    ["url", "  JAVASCRIPT:alert(1)", ""],
  ])("TestReadOnlyLink_%s_PreservesHrefProtection", (type, value, href) => {
    renderReadOnlyValue(snapshot(type, value));
    expect(screen.getByText(value.trim()).closest("a")).toHaveAttribute(
      "href",
      href,
    );
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });

  it.each(["email", "phone", "url"])(
    "TestReadOnlyLink_%sEmpty_RendersEmpty",
    (type) => {
      renderReadOnlyValue(snapshot(type, ""));
      expect(screen.getByText("Empty")).toBeVisible();
    },
  );

  it.each(["email", "phone", "url"])(
    "TestReadOnlyLink_%sInvalid_FallsBack",
    (type) => {
      renderReadOnlyValue(snapshot(type, null));
      expect(screen.getByText("Historical fallback")).toBeVisible();
    },
  );
});
