import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type {
  CellPlugin,
  GroupingValueProps,
} from "@notion-kit/table-hook/plugins";

import {
  checkbox,
  createdTime,
  date,
  DEFAULT_PLUGINS,
  DefaultGroupingValue,
  email,
  lastEditedTime,
  multiSelect,
  number,
  phone,
  select,
  text,
  title,
  url,
} from "@/plugins";

describe("table-view plugin wrappers", () => {
  it("preserves the configured default plugin order", () => {
    expect(DEFAULT_PLUGINS.map(({ id }) => id)).toEqual([
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
    ]);
  });

  it.each([
    title,
    text,
    number,
    checkbox,
    select,
    multiSelect,
    email,
    phone,
    url,
    date,
    createdTime,
    lastEditedTime,
  ])("injects the existing UI into a no-argument factory", (factory) => {
    const plugin = factory();
    expect(plugin.meta.icon).not.toBeNull();
    expect(plugin.default.icon).not.toBeNull();
    expect(plugin.renderCellValue).toEqual(expect.any(Function));
    expect(plugin.renderGroupingValue).toEqual(expect.any(Function));
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

  it("keeps direct custom plugins compatible with configured defaults", () => {
    const custom: CellPlugin<"custom", string, undefined> = {
      id: "custom",
      meta: { name: "Custom", desc: "", icon: null },
      default: { name: "Custom", icon: null, data: "", config: undefined },
      fromValue: (value) => value?.toString() ?? "",
      toValue: (data) => data,
      toTextValue: (data) => data,
      isEmpty: (data) => data.trim() === "",
      renderCellValue: () => null,
    };

    expect([...DEFAULT_PLUGINS, custom].at(-1)?.id).toBe("custom");
  });
});
