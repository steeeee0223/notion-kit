import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import type { SelectConfig } from "@notion-kit/table-hook/plugins";
import { COLOR } from "@notion-kit/utils";

import {
  renderReadOnlyValue,
  snapshot,
} from "@/edit-log/__tests__/render-read-only-value";

const config: SelectConfig = {
  options: {
    names: ["Old status", "Removed tag"],
    items: {
      "Old status": { id: "option-old", name: "Old status", color: "purple" },
      "Removed tag": {
        id: "option-removed",
        name: "Removed tag",
        color: "red",
      },
    },
  },
  sort: "manual",
};

describe("ReadOnlySelectValue", () => {
  it.each(["select", "multi-select"])(
    "TestReadOnlySelect_%sHistoricalOptions_PreservesNamesAndColors",
    async (type) => {
      const value =
        type === "select" ? "Old status" : ["Old status", "Removed tag"];
      renderReadOnlyValue(snapshot(type, value, config));
      const tag = screen.getByText("Old status");
      expect(tag.parentElement).toHaveStyle({
        backgroundColor: COLOR.purple.rgba,
      });
      expect(tag.closest(".flex-wrap")).not.toBeNull();
      if (type === "multi-select")
        expect(screen.getByText("Removed tag")).toBeVisible();
      await userEvent.setup().click(tag);
      expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    },
  );

  it.each([
    ["select", null],
    ["select", ""],
    ["multi-select", []],
  ])("TestReadOnlySelect_%sEmpty_RendersEmpty", (type, value) => {
    renderReadOnlyValue(snapshot(type, value, config));
    expect(screen.getByText("Empty")).toBeVisible();
  });

  it.each([
    ["select", "Missing", config],
    ["multi-select", ["Old status", "Missing"], config],
    ["select", ["Old status"], config],
    ["multi-select", "Old status", config],
    ["select", "Old status", undefined],
    [
      "select",
      "Old status",
      {
        ...config,
        options: {
          names: [],
          items: {
            "Old status": { id: "old", name: "Old status", color: "invalid" },
          },
        },
      },
    ],
  ])(
    "TestReadOnlySelect_%sInvalidSnapshot_FallsBackWithoutDroppingMissingOptions",
    (type, value, config) => {
      renderReadOnlyValue(snapshot(type, value, config));
      expect(screen.getByText("Historical fallback")).toBeVisible();
      expect(screen.queryByText("Old status")).not.toBeInTheDocument();
    },
  );
});
