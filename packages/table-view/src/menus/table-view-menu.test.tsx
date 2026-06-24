import { describe, expect, it } from "vitest";

import { renderTableView } from "../__tests__/component-objects/render-table-view";
import { mockResizeObserver } from "../__tests__/mock";

mockResizeObserver();

describe("TableViewMenu", () => {
  it.each([
    ["Layout", "Layout"],
    ["Sort", "Sort"],
    ["Group", "Group by"],
  ])(
    "TableViewMenu_%sNavigation_OpensExpectedPage",
    async (itemName, heading) => {
      const tableView = renderTableView();
      const settings = await tableView.openViewSettings();

      const page = await settings.openPage(itemName, heading);

      expect(page.heading(heading)).toBeVisible();
    },
  );

  it("TableViewMenu_LayoutNavigation_ShowsTableOption", async () => {
    const tableView = renderTableView();
    const settings = await tableView.openViewSettings();

    const layout = await settings.openPage("Layout", "Layout");

    expect(layout.text("Table")).toBeVisible();
    expect(layout.root).toBeInTheDocument();
  });

  it("TableViewMenu_EditPropertiesNavigation_ShowsProperties", async () => {
    const tableView = renderTableView();
    const settings = await tableView.openViewSettings();

    const properties = await settings.openPage("Edit properties", "Properties");

    expect(properties.option("Name")).toBeVisible();
    expect(properties.option("Done")).toBeVisible();
  });

  it("TableViewMenu_LockDatabase_TogglesToUnlock", async () => {
    const tableView = renderTableView();
    const settings = await tableView.openViewSettings();

    await settings.toggleLock();

    expect(settings.item("Unlock database")).toBeVisible();
  });

  it("TableViewMenu_LockedDatabase_DisablesEditProperties", async () => {
    const tableView = renderTableView();
    const settings = await tableView.openViewSettings();

    await settings.toggleLock();

    expect(settings.item("Unlock database")).toBeVisible();
    expect(settings.item("Edit properties")).toHaveAttribute(
      "aria-disabled",
      "true",
    );
  });

  it("TableViewMenu_SortBackNavigation_ReturnsToViewSettings", async () => {
    const tableView = renderTableView();
    const settings = await tableView.openViewSettings();
    const sort = await settings.openPage("Sort", "Sort");

    await sort.back();

    expect(settings.heading()).toBeVisible();
  });
});
