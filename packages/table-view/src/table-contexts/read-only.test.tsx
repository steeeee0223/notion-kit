import { screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderTableView } from "@/__tests__/component-objects/render-table-view";
import { mockResizeObserver } from "@/__tests__/mock";

mockResizeObserver();

describe("ReadOnly", () => {
  it("ReadOnly_True_HidesNewSettingsAndFooterButKeepsSearchSortFilter", async () => {
    const tableView = renderTableView({ readOnly: true });

    expect(
      screen.queryByRole("button", { name: "New" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Settings" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryAllByRole("button", { name: /calculation$/ }),
    ).toHaveLength(0);

    expect(tableView.button("Filter")).toBeVisible();
    expect(tableView.button("Sort")).toBeVisible();

    await tableView.clickButton("Search");
    await tableView.user.type(tableView.searchInput(), "Task 1");

    expect(tableView.rows("Task 1")).toHaveLength(1);
  });

  it("ReadOnly_True_BehavesAsLockedNoSelectionNoRowActions", () => {
    renderTableView({ readOnly: true });

    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Row actions" }),
    ).not.toBeInTheDocument();
  });

  it("ReadOnly_Undefined_KeepsCurrentBehaviorWithNewSettingsAndFooterVisible", () => {
    renderTableView();

    expect(screen.getByRole("button", { name: "Settings" })).toBeVisible();
    expect(
      screen.getAllByRole("button", { name: /calculation$/ }).length,
    ).toBeGreaterThan(0);
  });

  it("ReadOnly_HideFooterFalse_KeepsFooterVisibleWhileStillLocked", async () => {
    const tableView = renderTableView({ readOnly: { hideFooter: false } });

    expect(
      screen.getAllByRole("button", { name: /calculation$/ }).length,
    ).toBeGreaterThan(0);
    expect(
      screen.queryByRole("button", { name: "New" }),
    ).not.toBeInTheDocument();
    await waitFor(() => expect(tableView).toBeDefined());
  });

  it("ReadOnly_OnNewRowProvided_ToolbarNewCallsOnNewRow", async () => {
    let called = false;
    const tableView = renderTableView({
      onNewRow: () => {
        called = true;
      },
    });

    await tableView.clickButton("New");

    expect(called).toBe(true);
  });

  it("ReadOnly_DefaultNewButton_CallsAddRowByDefault", async () => {
    const tableView = renderTableView();
    const before = tableView.rows().length;

    await tableView.clickButton("New");

    await waitFor(() => expect(tableView.rows().length).toBe(before + 1));
  });
});
