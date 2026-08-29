import { screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { renderTableView } from "../__tests__/component-objects/render-table-view";
import { createFullPluginFixture, mockResizeObserver } from "../__tests__/mock";

mockResizeObserver();

afterEach(() => {
  vi.restoreAllMocks();
});

describe("Toolbar", () => {
  it("Toolbar_Search_FiltersRowsAndClearRestoresThem", async () => {
    const fixture = createFullPluginFixture();
    const tableView = renderTableView(fixture);
    const searchInput = document.querySelector(
      'input[aria-label="Search table"]',
    );

    expect(searchInput).toBeInTheDocument();
    expect(searchInput).toHaveAttribute("aria-hidden", "true");
    expect(tableView.button("Search")).toHaveAttribute(
      "aria-controls",
      searchInput?.id,
    );
    expect(tableView.button("Search")).toHaveAttribute(
      "aria-expanded",
      "false",
    );

    await tableView.clickButton("Search");

    expect(tableView.searchInput()).toBe(searchInput);
    expect(tableView.searchInput()).toHaveFocus();
    expect(tableView.button("Search")).toHaveAttribute("aria-expanded", "true");

    await tableView.user.type(tableView.searchInput(), "Alpha");

    expect(tableView.rows("Alpha")).toHaveLength(1);
    expect(tableView.rows("Empty")).toHaveLength(0);
    expect(tableView.rows("Omega")).toHaveLength(0);

    await tableView.clickButton("Search");

    expect(searchInput).toHaveAttribute("aria-hidden", "true");
    expect(searchInput).toHaveValue("Alpha");
    expect(tableView.rows("Alpha")).toHaveLength(1);
    await tableView.clickButton("Search");

    expect(tableView.button("Clear input")).toBeVisible();

    await tableView.clickButton("Clear input");

    expect(tableView.rows()).toHaveLength(fixture.data.length);
  });

  it("Toolbar_Search_CollapsedQueryHidesClearAction", async () => {
    const tableView = renderTableView();

    await tableView.clickButton("Search");
    await tableView.user.type(tableView.searchInput(), "Task");

    expect(tableView.button("Clear input")).toBeVisible();

    await tableView.clickButton("Search");

    expect(
      screen.queryByRole("button", { name: "Clear input" }),
    ).not.toBeInTheDocument();
  });

  it("Toolbar_FilterTrigger_ExposesDetachedPopoverSemantics", async () => {
    const tableView = renderTableView();
    const filter = tableView.button("Filter");

    expect(filter).toHaveAttribute("aria-haspopup", "dialog");
    expect(filter).toHaveAttribute("aria-expanded", "false");

    await tableView.clickButton("Filter");

    expect(filter).toHaveAttribute("aria-expanded", "true");
  });

  it("Toolbar_FilterTrigger_OpensOneSharedEditorWithoutPersistingAnEmptyTree", async () => {
    const onViewChange = vi.fn();
    const tableView = renderTableView({ onViewChange });

    await tableView.clickButton("Filter");

    const dialog = screen.getByRole("dialog", { name: "Filters" });
    expect(dialog).toBeVisible();
    expect(screen.getAllByRole("region", { name: "Filters" })).toHaveLength(1);
    expect(
      await screen.findByRole("button", { name: "Add filter rule" }),
    ).toBeVisible();
    expect(onViewChange).not.toHaveBeenCalled();

    await tableView.user.keyboard("{Escape}");
    await tableView.user.keyboard("{Escape}");
    await waitFor(() =>
      expect(
        screen.queryByRole("region", { name: "Filters" }),
      ).not.toBeInTheDocument(),
    );

    expect(onViewChange).not.toHaveBeenCalled();
  });

  it("Toolbar_FilterTrigger_TreatsAnAuthoritativeEmptyRootAsInactive", async () => {
    const onViewChange = vi.fn();
    const tableView = renderTableView({
      view: {
        layout: "table",
        filters: {
          kind: "group",
          id: "authoritative-root",
          logic: "and",
          children: [
            {
              kind: "group",
              id: "nested-empty",
              logic: "or",
              children: [],
            },
          ],
        },
      },
      onViewChange,
    });

    expect(screen.queryByTestId("table-view-active-bar")).toBeNull();
    await tableView.clickButton("Filter");

    expect(screen.getByTestId("filter-group-nested-empty")).toBeVisible();
    expect(
      await screen.findAllByRole("button", { name: "Add filter rule" }),
    ).toHaveLength(2);
    expect(onViewChange).not.toHaveBeenCalled();

    await tableView.user.keyboard("{Escape}");
    await tableView.user.keyboard("{Escape}");
    await waitFor(() =>
      expect(
        screen.queryByRole("dialog", { name: "Filters" }),
      ).not.toBeInTheDocument(),
    );

    expect(onViewChange).not.toHaveBeenCalled();
    expect(screen.queryByTestId("table-view-active-bar")).toBeNull();
  });

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
