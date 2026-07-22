import type { ComponentProps } from "react";
import { render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";

import { SelectGroupingValue } from "./select-grouping-value";

function tableWithTag(description?: string) {
  return {
    getGroupedColumnInfo: () => ({
      config: {
        options: {
          items: {
            Active: {
              id: "active",
              name: "Active",
              color: "blue",
              description,
            },
          },
        },
      },
    }),
  } as unknown as ComponentProps<typeof SelectGroupingValue>["table"];
}

it.each([
  ["without description", undefined],
  ["with description", "Work in progress"],
] as const)(
  "SelectGroupingValue_Tag%s_RendersConfiguredOption",
  (_case, description) => {
    render(
      <SelectGroupingValue value="Active" table={tableWithTag(description)} />,
    );

    expect(screen.getByText("Active")).toBeVisible();
  },
);

it("SelectGroupingValue_UnknownTag_ReportsInvariantAndRendersNothing", () => {
  const error = vi.spyOn(console, "error").mockImplementation(() => undefined);
  const { container } = render(
    <SelectGroupingValue value="Missing" table={tableWithTag()} />,
  );

  expect(container).toBeEmptyDOMElement();
  expect(error).toHaveBeenCalledWith(
    "[SelectGroupingValue] tag not found for grouping value: Missing",
  );
  error.mockRestore();
});
