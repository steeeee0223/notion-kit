import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { ColumnDefs, Row } from "@notion-kit/table-hook";
import type { CellPlugin } from "@notion-kit/table-hook/plugins";

import { renderTableView } from "@/__tests__/component-objects/render-table-view";
import { mockResizeObserver } from "@/__tests__/mock";

import { DEFAULT_PLUGINS } from ".";
import type { CellProps, TableUiPlugin } from "./registry";

mockResizeObserver();

/**
 * A consumer-defined "status" property that is intentionally read-only: it
 * registers only the required `renderCell`/`renderGroupingValue` fields plus
 * the optional `renderReadOnlyValue`, and never calls `cell.update`. This
 * proves the registry does not force any editing surface (`renderBulkEditor`
 * and `renderConfigMenu` stay unset).
 */
type StatusValue = "open" | "in_progress" | "done";
type StatusPlugin = CellPlugin<"status", StatusValue, undefined>;

const STATUS_META: Record<StatusValue, { label: string; className: string }> = {
  open: { label: "Open", className: "bg-gray-200 text-gray-900" },
  in_progress: { label: "In progress", className: "bg-blue-200 text-blue-900" },
  done: { label: "Done", className: "bg-green-200 text-green-900" },
};

const statusPlugin: StatusPlugin = {
  id: "status",
  default: { data: "open", config: undefined },
  fromValue: (value) =>
    value === "in_progress" || value === "done" ? value : "open",
  toValue: (data) => data,
  isEmpty: () => false,
  toTextValue: (data) => STATUS_META[data].label,
};

function StatusBadge({ cell }: CellProps) {
  const data = cell.getData<StatusPlugin>();
  const meta = STATUS_META[data];
  return (
    <span
      data-testid="status-badge"
      className={`rounded-full px-2 py-0.5 text-xs ${meta.className}`}
    >
      {meta.label}
    </span>
  );
}

const statusPluginUi: TableUiPlugin<StatusPlugin> = {
  id: "status",
  meta: { name: "Status", desc: "A read-only status badge", icon: null },
  default: { name: "Status", icon: null },
  renderCell: (props) => <StatusBadge {...props} />,
  renderGroupingValue: ({ value }) => <>{String(value)}</>,
};

describe("ReadOnlyCustomPlugin", () => {
  it("Plugin_OnlyRenderCellAndGroupingValue_RegistersWithoutBulkEditorOrConfigMenu", () => {
    expect(statusPluginUi.renderBulkEditor).toBeUndefined();
    expect(statusPluginUi.renderConfigMenu).toBeUndefined();
  });

  it("Plugin_ReadOnlyStatusBadge_RendersColoredBadgeInsideReadOnlyTable", () => {
    const plugins = {
      data: [...DEFAULT_PLUGINS.data, statusPlugin],
      ui: [...DEFAULT_PLUGINS.ui, statusPluginUi],
    };
    const properties: ColumnDefs<typeof plugins.data> = [
      { id: "name", name: "Name", type: "title" },
      { id: "status", name: "Status", type: "status", config: undefined },
    ];
    const now = Date.now();
    const data: Row<typeof plugins.data>[] = [
      {
        id: "capture-1",
        createdAt: now,
        lastEditedAt: now,
        properties: {
          name: { id: "capture-1-name", value: "Invoice from Acme" },
          status: { id: "capture-1-status", value: "in_progress" },
        },
      },
    ];

    renderTableView({ plugins, properties, data, readOnly: true });

    const badge = screen.getByTestId("status-badge");
    expect(badge).toHaveTextContent("In progress");
    expect(
      screen.queryByRole("button", { name: "New" }),
    ).not.toBeInTheDocument();
  });
});
