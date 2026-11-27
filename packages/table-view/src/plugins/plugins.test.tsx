import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { DEFAULT_PLUGINS, DefaultGroupingValue } from ".";
import type { GroupingValueProps } from "./registry";

describe("table-view plugin wrappers", () => {
  it("preserves the configured default plugin order", () => {
    expect(DEFAULT_PLUGINS.data.map(({ id }) => id)).toEqual([
      "title",
      "text",
      "number",
      "checkbox",
      "select",
      "multi-select",
      "email",
      "phone",
      "url",
      "date",
      "created-time",
      "last-edited-time",
      "id",
      "person",
      "created-by",
      "last-edited-by",
      "location",
      "relation",
      "rollup",
    ]);
  });

  it("renders the headless default grouping label with table-view UI", () => {
    render(
      <DefaultGroupingValue
        table={{} as GroupingValueProps["table"]}
        value={false}
      />,
    );

    expect(screen.getByText("False")).toHaveClass("truncate");
  });
});
