import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  DEFAULT_DATA_PLUGINS,
  DEFAULT_PLUGINS,
  DEFAULT_UI_PLUGINS,
  DefaultGroupingValue,
} from ".";
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

  it("pairs every default data plugin with a direct UI adapter", () => {
    expect(DEFAULT_DATA_PLUGINS.map(({ id }) => id)).toEqual(
      DEFAULT_UI_PLUGINS.map(({ id }) => id),
    );
    for (const plugin of DEFAULT_UI_PLUGINS) {
      expect(plugin.meta.icon).not.toBeNull();
      expect(plugin.default.icon).not.toBeNull();
      expect(plugin.renderCell).toEqual(expect.any(Function));
      expect(plugin.renderGroupingValue).toEqual(expect.any(Function));
    }
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
