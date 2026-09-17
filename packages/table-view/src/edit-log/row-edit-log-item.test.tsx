import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { mockData, mockProperties, mockResizeObserver } from "@/__tests__/mock";
import { DEFAULT_PLUGINS } from "@/plugins";
import { TableViewWrapper } from "@/table-contexts";

import { RowEditLogItem } from "./row-edit-log-item";
import type { RowEditLog } from "./types";

mockResizeObserver();

const record: RowEditLog = {
  id: "history-1",
  editedAt: 1_700_000_000_000,
  rowId: "row1",
  property: {
    id: "removed-property",
    name: "Original label",
    icon: { type: "emoji", src: "📚" },
    type: "text",
  },
  value: "Historical text",
  textValue: "Fallback text",
};

describe("RowEditLogItem", () => {
  it("renders the original label, icon, time and value after its property was removed", () => {
    render(
      <TableViewWrapper
        defaultData={mockData}
        defaultProperties={mockProperties}
      >
        <ul>
          <RowEditLogItem record={record} />
        </ul>
      </TableViewWrapper>,
    );
    const item = screen.getByRole("listitem");
    expect(within(item).getByText("Original label")).toBeVisible();
    expect(within(item).getByText("📚")).toBeVisible();
    expect(within(item).getByText("Historical text")).toBeVisible();
    expect(item.querySelector("time")).toHaveAttribute(
      "datetime",
      new Date(record.editedAt).toISOString(),
    );
    expect(within(item).queryByRole("textbox")).not.toBeInTheDocument();
    expect(within(item).queryByRole("button")).not.toBeInTheDocument();
  });

  it("keeps unknown types and failed renderers local to their own entries", () => {
    const error = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const plugins = {
      ...DEFAULT_PLUGINS,
      ui: DEFAULT_PLUGINS.ui.map((plugin) =>
        plugin.id === "text"
          ? {
              ...plugin,
              renderReadOnlyValue: () => {
                throw new Error("Renderer failed");
              },
            }
          : plugin,
      ),
    };
    render(
      <TableViewWrapper
        plugins={plugins}
        defaultData={mockData}
        defaultProperties={mockProperties}
      >
        <ul>
          <RowEditLogItem
            record={{ ...record, textValue: "Recovered failed text" }}
          />
          <RowEditLogItem
            record={{
              ...record,
              id: "unknown",
              property: {
                ...record.property,
                type: "unknown",
                icon: undefined,
              },
              textValue: "Future type text",
            }}
          />
          <RowEditLogItem
            record={{
              ...record,
              id: "healthy",
              property: {
                ...record.property,
                type: "number",
                config: { format: "number" },
              },
              value: 0,
              textValue: "0",
            }}
          />
        </ul>
      </TableViewWrapper>,
    );
    expect(screen.getByText("Recovered failed text")).toBeVisible();
    expect(screen.getByText("Future type text")).toBeVisible();
    expect(screen.getByText("0")).toBeVisible();
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
    error.mockRestore();
  });
});
