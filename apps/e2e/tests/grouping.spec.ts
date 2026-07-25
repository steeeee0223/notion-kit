import type { Locator } from "@playwright/test";

import { expect, test } from "./fixtures";
import { TableViewObject } from "./component-objects/table-view";

async function expectVerticalOrder(locators: Locator[]) {
  const boxes = await Promise.all(locators.map((locator) => locator.boundingBox()));
  for (const [index, box] of boxes.entries()) {
    expect(box, `Expected item ${index} to be visible`).not.toBeNull();
    if (index === 0) continue;
    expect(box!.y).toBeGreaterThan(boxes[index - 1]!.y);
  }
}

test("Grouping_StatusVisibilityAndRemoval_UpdatesMembershipWithoutViewWriteback", async ({
  page,
}) => {
  const table = await TableViewObject.open(page, "controlled");
  const settings = await table.openSettings();
  const selectGrouping = await settings.openGrouping();
  await selectGrouping.choose("Status");

  await expect(table.internalState()).toContainText('"grouping":["status"]');
  await expect(table.internalState()).toContainText(
    '"groupOrder":["status:Active","status:null","status:Done"]',
  );
  await expect(table.controlledState()).toContainText('"viewCount":0');
  await page.keyboard.press("Escape");
  await table.expandGroup("status:Active");
  await table.expandGroup("status:null");
  await table.expandGroup("status:Done");
  await expectVerticalOrder([
    table.group("status:Active"),
    table.row("Alpha"),
    table.group("status:null"),
    table.row("Empty"),
    table.group("status:Done"),
    table.row("Omega"),
  ]);

  const groupedSettings = await table.openSettings();
  const grouping = await groupedSettings.openGrouping();
  await grouping.toggleGroup("status:Active");
  await expect(table.group("status:Active")).toHaveCount(0);
  await expect(table.row("Alpha")).toHaveCount(0);
  await grouping.toggleGroup("status:Active");
  await expect(table.row("Alpha")).toBeVisible();

  await grouping.toggleAll();
  await expect(table.rows()).toHaveCount(0);
  await grouping.toggleAll();
  await expect(table.rows()).toHaveCount(3);

  await grouping.toggleHideEmptyGroups();
  await expect(table.internalState()).toContainText('"hideEmptyGroups":false');
  await grouping.toggleHideEmptyGroups();
  await expect(table.internalState()).toContainText('"hideEmptyGroups":true');

  await grouping.remove();
  await expect(table.internalState()).toContainText('"grouping":[]');
  await expect(table.rowTitles()).toHaveCount(3);
});

test("Grouping_CompleteThenBoard_PreservesGroupMembershipAcrossLayouts", async ({
  page,
}) => {
  const table = await TableViewObject.open(page, "controlled");
  let settings = await table.openSettings();
  const selectGrouping = await settings.openGrouping();
  await selectGrouping.choose("Complete");
  await page.keyboard.press("Escape");
  await table.expandGroup("complete:true");
  await table.expandGroup("complete:false");

  await expectVerticalOrder([
    table.group("complete:true"),
    table.row("Alpha"),
    table.group("complete:false"),
    table.row("Empty"),
    table.row("Omega"),
  ]);

  settings = await table.openSettings();
  const layout = await settings.openLayout();
  await layout.button("Board").click();

  const checked = table.group("complete:true");
  const unchecked = table.group("complete:false");
  await expect(checked.getByText("Alpha", { exact: true })).toBeVisible();
  await expect(checked.getByText("Empty", { exact: true })).toHaveCount(0);
  await expect(unchecked.getByText("Empty", { exact: true })).toBeVisible();
  await expect(unchecked.getByText("Omega", { exact: true })).toBeVisible();
  await expect(table.controlledState()).toContainText(
    '"type":"view.layout.change"',
  );
  await expect(table.internalState()).toContainText(
    '"grouping":["complete"]',
  );
});
