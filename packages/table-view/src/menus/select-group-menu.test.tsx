import { describe, expect, it } from "vitest";

import { EditGroupingMenuObject } from "../__tests__/component-objects/grouping-menu";
import { renderTableView } from "../__tests__/component-objects/render-table-view";
import { mockResizeObserver } from "../__tests__/mock";

mockResizeObserver();

async function openSelectGroupingMenu() {
  const tableView = renderTableView();
  const settings = await tableView.openViewSettings();
  return { tableView, grouping: await settings.openSelectGrouping() };
}

describe("SelectGroupMenu", () => {
  it("SelectGroupingMenu_Search_FiltersProperties", async () => {
    const { grouping } = await openSelectGroupingMenu();

    await grouping.search("Done");

    expect(grouping.option("Done")).toBeVisible();
    expect(grouping.queryOption("Name")).not.toBeInTheDocument();
  });

  it("SelectGroupingMenu_PropertySelection_OpensEditGrouping", async () => {
    const { grouping } = await openSelectGroupingMenu();

    const editGrouping = await grouping.select("Done");

    expect(editGrouping.heading()).toBeVisible();
    expect(editGrouping.selectedProperty("Done")).toBeVisible();
  });

  it("SelectGroupingMenu_KeyboardSelection_UsesNativeNavigation", async () => {
    const { tableView, grouping } = await openSelectGroupingMenu();
    await grouping.search("Done");
    await tableView.user.keyboard("{ArrowDown}{Enter}");
    const edit = await EditGroupingMenuObject.find(tableView.user);
    expect(edit.selectedProperty("Done")).toBeVisible();
  });

  it("SelectGroupingMenu_BackNavigation_ReturnsToViewSettings", async () => {
    const { grouping } = await openSelectGroupingMenu();

    const settings = await grouping.backToViewSettings();

    expect(settings.heading("View Settings")).toBeVisible();
  });
});
