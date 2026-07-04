import { describe, expect, it } from "vitest";

import { renderTableView } from "../__tests__/component-objects/render-table-view";
import { mockResizeObserver } from "../__tests__/mock";

mockResizeObserver();

async function openSelectGroupingMenu() {
  const tableView = renderTableView();
  const settings = await tableView.openViewSettings();
  return { tableView, grouping: await settings.openSelectGrouping() };
}

describe("SelectGroupMenu", () => {
  it("SelectGroupingMenu_Open_ShowsHeadingAndOptions", async () => {
    const { grouping } = await openSelectGroupingMenu();

    expect(grouping.heading()).toBeVisible();
    expect(grouping.option("None")).toBeVisible();
    expect(grouping.option("Name")).toBeVisible();
    expect(grouping.option("Done")).toBeVisible();
  });

  it("SelectGroupingMenu_Open_ShowsPropertySearch", async () => {
    const { grouping } = await openSelectGroupingMenu();

    expect(grouping.searchInput()).toBeVisible();
  });

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

  it("SelectGroupingMenu_NoGrouping_ShowsNoneOption", async () => {
    const { grouping } = await openSelectGroupingMenu();

    expect(grouping.option("None")).toBeVisible();
  });

  it("SelectGroupingMenu_BackNavigation_ReturnsToViewSettings", async () => {
    const { grouping } = await openSelectGroupingMenu();

    const settings = await grouping.backToViewSettings();

    expect(settings.heading("View Settings")).toBeVisible();
  });
});
