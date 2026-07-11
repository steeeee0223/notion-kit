import { screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { renderTableView } from "../__tests__/component-objects/render-table-view";
import { mockResizeObserver } from "../__tests__/mock";

mockResizeObserver();

afterEach(() => {
  vi.restoreAllMocks();
});

describe("Toolbar", () => {
  it("Toolbar_SortTrigger_ExposesMenuSemantics", () => {
    const tableView = renderTableView();

    expect(tableView.button("Sort")).toHaveAttribute("aria-haspopup", "menu");
  });

  it("Toolbar_SortTrigger_OpensSortMenu", async () => {
    const tableView = renderTableView();

    const sort = await tableView.openSortMenu();

    expect(sort.addSortItem()).toBeVisible();
    expect(sort.deleteSortItem()).toBeVisible();
  });

  it("Toolbar_SortMenu_ClosesOnOutsideClick", async () => {
    const tableView = renderTableView();
    const sort = await tableView.openSortMenu();

    await tableView.clickOutside();
    await sort.waitUntilClosed();

    expect(sort.root).not.toBeInTheDocument();
  });

  it("Toolbar_SettingsTrigger_ExposesMenuSemantics", () => {
    const tableView = renderTableView();

    expect(tableView.button("Settings")).toHaveAttribute(
      "aria-haspopup",
      "menu",
    );
  });

  it("Toolbar_SettingsTrigger_OpensViewSettings", async () => {
    const tableView = renderTableView();

    const settings = await tableView.openViewSettings();

    expect(settings.heading()).toBeVisible();
  });

  it("Toolbar_SettingsClick_RequestsOneOpenTransition", async () => {
    const tableView = renderTableView();

    const settings = await tableView.openViewSettings();

    expect(
      screen.getAllByRole("heading", { name: "View Settings" }),
    ).toHaveLength(1);
    expect(settings.heading()).toBeVisible();
  });

  it("Toolbar_ViewSettings_ClosesOnOutsideClick", async () => {
    const tableView = renderTableView();
    const settings = await tableView.openViewSettings();

    await tableView.clickOutside();
    await settings.waitUntilClosed();

    expect(settings.root).not.toBeInTheDocument();
  });

  it("Toolbar_SettingsTrigger_TogglesMenu", async () => {
    const tableView = renderTableView();
    const firstSettings = await tableView.openViewSettings();

    await tableView.clickButton("Settings");
    await firstSettings.waitUntilClosed();
    const reopenedSettings = await tableView.openViewSettings();

    expect(firstSettings.root).not.toBeInTheDocument();
    expect(reopenedSettings.heading()).toBeVisible();
  });

  it("Toolbar_ViewSettingsClose_ClosesMenu", async () => {
    const tableView = renderTableView();
    const settings = await tableView.openViewSettings();

    await settings.close();
    await settings.waitUntilClosed();

    expect(settings.root).not.toBeInTheDocument();
  });
});
