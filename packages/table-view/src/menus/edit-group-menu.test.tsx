import { describe, expect, it } from "vitest";

import { renderTableView } from "../__tests__/component-objects/render-table-view";
import { mockResizeObserver } from "../__tests__/mock";

mockResizeObserver();

async function openEditGroupingMenu() {
  const tableView = renderTableView();
  const settings = await tableView.openViewSettings();
  const selectGrouping = await settings.openSelectGrouping();
  return { tableView, grouping: await selectGrouping.select("Done") };
}

describe("EditGroupMenu", () => {
  it("EditGroupingMenu_Open_ShowsSelectedPropertyAndMoveHandle", async () => {
    const { grouping } = await openEditGroupingMenu();

    expect(grouping.heading()).toBeVisible();
    expect(grouping.groupByItem()).toBeVisible();
    expect(grouping.selectedProperty("Done")).toBeVisible();
    expect(grouping.firstMoveHandle()).toBeVisible();
  });

  it("EditGroupingMenu_Open_ShowsHideEmptyGroups", async () => {
    const { grouping } = await openEditGroupingMenu();

    expect(grouping.hideEmptyGroupsItem()).toBeVisible();
  });

  it("EditGroupingMenu_HideEmptyGroupsToggle_StaysOpen", async () => {
    const { grouping } = await openEditGroupingMenu();
    const initialState = grouping
      .hideEmptyGroupsItem()
      .getAttribute("aria-checked");

    await grouping.toggleHideEmptyGroups();

    expect(grouping.hideEmptyGroupsItem()).not.toHaveAttribute(
      "aria-checked",
      initialState,
    );
    expect(grouping.heading()).toBeVisible();
  });

  it("EditGroupingMenu_Open_ShowsGroupsVisibilityAction", async () => {
    const { grouping } = await openEditGroupingMenu();

    expect(grouping.groupsLabel()).toBeVisible();
    expect(grouping.allVisibilityButton()).toBeVisible();
  });

  it("EditGroupingMenu_Open_ShowsRemoveGrouping", async () => {
    const { grouping } = await openEditGroupingMenu();

    expect(grouping.removeGroupingItem()).toBeVisible();
  });

  it("EditGroupingMenu_GroupVisibilityToggle_StaysOpen", async () => {
    const { grouping } = await openEditGroupingMenu();

    await grouping.toggleFirstGroupVisibility();

    expect(grouping.heading()).toBeVisible();
  });

  it("EditGroupingMenu_RemoveGrouping_ClearsSelection", async () => {
    const { tableView, grouping } = await openEditGroupingMenu();

    await grouping.removeGrouping();
    const settings = await tableView.openViewSettings();

    expect(settings.groupingSelection("Done")).toBe(false);
  });

  it("EditGroupingMenu_Open_ShowsGroupingHelp", async () => {
    const { grouping } = await openEditGroupingMenu();

    expect(grouping.helpItem()).toBeVisible();
  });

  it("EditGroupingMenu_ChangeGrouping_OpensSelection", async () => {
    const { grouping } = await openEditGroupingMenu();

    const selectGrouping = await grouping.changeGrouping();

    expect(selectGrouping.heading()).toBeVisible();
  });

  it("EditGroupingMenu_BackNavigation_ReturnsToViewSettings", async () => {
    const { grouping } = await openEditGroupingMenu();

    const settings = await grouping.backToViewSettings();

    expect(settings.heading("View Settings")).toBeVisible();
  });
});
