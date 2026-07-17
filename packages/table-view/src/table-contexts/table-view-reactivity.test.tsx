import { Profiler } from "react";
import { screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderTableView } from "../__tests__/component-objects/render-table-view";
import { mockProperties, mockResizeObserver } from "../__tests__/mock";
import { useTableViewCtx } from "./table-view-provider";

mockResizeObserver();

describe("TableViewReactivity", () => {
  it("TableViewReactivity_LayoutSwitch_RendersSelectedLayout", async () => {
    const tableView = renderTableView();
    const settings = await tableView.openViewSettings();
    const layout = await settings.openLayout();

    await layout.selectLayout("List");

    expect(screen.queryByRole("table")).not.toBeInTheDocument();
    expect(screen.getByText("Task 1")).toBeVisible();

    await layout.selectLayout("Board");

    expect(screen.getByText("Select a grouping property")).toBeVisible();
    expect(
      document.querySelector('[data-slot="notion-board-view"]'),
    ).toBeInTheDocument();
  });

  it("TableViewReactivity_LockToggle_HidesTableAddRow", async () => {
    const tableView = renderTableView();
    const settings = await tableView.openViewSettings();

    expect(screen.getByRole("button", { name: /new page/i })).toBeVisible();

    await settings.toggleLock();

    await waitFor(() => {
      expect(
        screen.queryByRole("button", { name: /new page/i }),
      ).not.toBeInTheDocument();
    });
    expect(settings.item("Unlock database")).toBeVisible();
  });

  it("TableViewReactivity_SortingChange_ShowsAndClearsSortSelector", async () => {
    const tableView = renderTableView();
    const sort = await tableView.openSortMenu();

    await sort.addRule("Name");
    await tableView.clickOutside();

    expect(screen.getAllByRole("button", { name: /name/i })).toHaveLength(2);

    const sortedMenu = await tableView.openSortMenu();
    await sortedMenu.deleteAll();
    await tableView.clickOutside();

    await waitFor(() => {
      expect(screen.getAllByRole("button", { name: /name/i })).toHaveLength(1);
    });
  });

  it("TableViewReactivity_InternalStoreUpdate_DoesNotBroadcastContextToChildren", async () => {
    const onProbeRender = vi.fn();

    function ContextProbe() {
      useTableViewCtx();
      return null;
    }

    const tableView = renderTableView({
      children: (
        <Profiler id="context-probe" onRender={onProbeRender}>
          <ContextProbe />
        </Profiler>
      ),
    });
    expect(onProbeRender).toHaveBeenCalledOnce();

    const sort = await tableView.openSortMenu();
    await sort.addRule("Name");
    await tableView.clickOutside();

    expect(screen.getAllByRole("button", { name: /name/i })).toHaveLength(2);
    expect(onProbeRender).toHaveBeenCalledOnce();
  });

  it("TableViewReactivity_RowOpen_RendersRowView", async () => {
    const tableView = renderTableView({
      properties: [
        {
          ...mockProperties[0]!,
          type: "title",
          config: { showIcon: true },
        },
        ...mockProperties.slice(1),
      ],
    });
    const rowActions = await tableView.openRowActions("Task 1");

    rowActions.choose("Open in side peek");

    expect(
      await screen.findByRole("heading", { name: "Task 1" }),
    ).toBeVisible();
  });
});
