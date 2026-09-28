import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { ColumnDefs } from "@notion-kit/table-hook";

import { renderTableView } from "@/__tests__/component-objects/render-table-view";
import { mockProperties, mockResizeObserver } from "@/__tests__/mock";
import type { DefaultPlugins } from "@/plugins";

mockResizeObserver();

const properties: ColumnDefs<DefaultPlugins> = [
  { ...mockProperties[0]!, type: "title", config: { showIcon: true } },
  ...mockProperties.slice(1),
];

describe("RowPeekSlot", () => {
  it("RowPeek_RenderRowView_AppearsBelowPropertyListInSideView", async () => {
    const tableView = renderTableView({
      properties,
      renderRowView: (row) => <div>Custom slot for {row.id}</div>,
    });

    const rowActions = await tableView.openRowActions("Task 1");
    rowActions.choose("Open in side peek");

    const dialog = await screen.findByRole("dialog", { name: "Task 1" });
    expect(within(dialog).getByText("Custom slot for row1")).toBeVisible();
  });

  it("RowPeek_OnRowOpen_FiresWithRowIdThenNullOnClose", async () => {
    const onRowOpen = vi.fn();
    const tableView = renderTableView({ properties, onRowOpen });

    const rowActions = await tableView.openRowActions("Task 1");
    rowActions.choose("Open in side peek");

    const dialog = await screen.findByRole("dialog", { name: "Task 1" });
    await waitFor(() => expect(onRowOpen).toHaveBeenLastCalledWith("row1"));

    fireEvent.click(within(dialog).getByRole("button", { name: "Close row" }));

    await waitFor(() => expect(onRowOpen).toHaveBeenLastCalledWith(null));
  });

  it("RowPeek_DefaultViewRowView_OpensInRequestedMode", async () => {
    const tableView = renderTableView({
      properties,
      defaultView: { rowView: "center" },
    });

    const rowActions = await tableView.openRowActions("Task 1");
    rowActions.choose("Open in center peek");

    expect(document.querySelector('[role="dialog"]#row1')).toBeVisible();
  });

  it("RowPeek_OpenRowOnClick_ClickingTheRowSurfaceOpensThePeek", async () => {
    const tableView = renderTableView({ properties, openRowOnClick: true });

    fireEvent.click(tableView.rowSurface("Task 1"));

    expect(await screen.findByRole("dialog", { name: "Task 1" })).toBeVisible();
  });

  it("RowPeek_OpenRowOnClick_EnterOnAFocusedRowOpensThePeek", async () => {
    const tableView = renderTableView({ properties, openRowOnClick: true });
    const surface = tableView.rowSurface("Task 1");
    surface.focus();

    fireEvent.keyDown(surface, { key: "Enter" });

    expect(await screen.findByRole("dialog", { name: "Task 1" })).toBeVisible();
  });

  it("RowPeek_OpenRowOnClickDisabled_ClickingTheRowSurfaceDoesNothing", () => {
    const tableView = renderTableView({ properties });

    fireEvent.click(tableView.rowSurface("Task 1"));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
