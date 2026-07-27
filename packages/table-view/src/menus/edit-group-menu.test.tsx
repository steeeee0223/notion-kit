import { afterEach, describe, expect, it, vi } from "vitest";

import { renderTableView } from "../__tests__/component-objects/render-table-view";
import { mockResizeObserver } from "../__tests__/mock";

mockResizeObserver();

afterEach(() => {
  vi.restoreAllMocks();
});

async function openEditGroupingMenu() {
  const tableView = renderTableView();
  const settings = await tableView.openViewSettings();
  const selectGrouping = await settings.openSelectGrouping();
  return { tableView, grouping: await selectGrouping.select("Done") };
}

describe("EditGroupMenu", () => {
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

  it("EditGroupingMenu_HelpAction_OpensDocumentedHelpTarget", async () => {
    const open = vi.spyOn(window, "open").mockImplementation(() => null);
    const { tableView, grouping } = await openEditGroupingMenu();

    await tableView.user.click(grouping.helpItem());

    expect(open).toHaveBeenCalledWith(
      "https://www.notion.com/help/boards#reorder-columns-&-cards",
      "_blank",
    );
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
