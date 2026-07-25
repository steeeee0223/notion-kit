import { TableViewObject } from "./component-objects/table-view";
import { expect, test } from "./fixtures";

async function groupByStatus(table: TableViewObject) {
  const settings = await table.openSettings();
  const grouping = await settings.openGrouping();
  await grouping.choose("Status");
  await table.page.keyboard.press("Escape");
}

test("GroupActions_AddAndAggregation_ApplyOnlyToSelectedGroup", async ({
  page,
}) => {
  const table = await TableViewObject.open(page, "controlled");
  await groupByStatus(table);

  const active = table.groupActions("status:Active");
  await expect(active.aggregationCount(1)).toBeVisible();
  await active.addRow();
  await expect(active.aggregationCount(2)).toBeVisible();
  await expect(table.controlledState()).toContainText(
    '"type":"data.row.create"',
  );
  await expect(table.controlledState()).toContainText(
    '"groupId":"status:Active"',
  );
  const snapshot = await table.controlledSnapshot();
  const createdId = snapshot.lastDataAction.payload.rowId as string;
  const created = snapshot.data.find(
    (row: { id: string }) => row.id === createdId,
  );
  expect(created.properties.status.value).toBe("Active");

  let menu = await active.openOptions();
  await menu.item("Hide aggregation").click();
  await expect(active.aggregationCount(2)).toHaveCount(0);
  menu = await active.openOptions();
  await menu.item("Show aggregation").click();
  await expect(active.aggregationCount(2)).toBeVisible();
});

test("GroupActions_HideAndDeleteConfirmation_RespectUserDecision", async ({
  page,
}) => {
  const table = await TableViewObject.open(page, "controlled");
  await groupByStatus(table);

  let active = table.groupActions("status:Active");
  let menu = await active.openOptions();
  await menu.item("Hide group").click();
  await expect(table.group("status:Active")).toHaveCount(0);

  let settings = await table.openSettings();
  let grouping = await settings.openGrouping();
  await grouping.toggleGroup("status:Active");
  await page.keyboard.press("Escape");
  active = table.groupActions("status:Active");

  menu = await active.openOptions();
  await menu.item("Delete rows").click();
  const confirmation = page.getByRole("dialog", {
    name: "Are you sure? All rows inside this group will be deleted.",
  });
  await confirmation.getByRole("button", { name: "Cancel" }).click();
  let snapshot = await table.controlledSnapshot();
  expect(snapshot.data).toEqual(
    expect.arrayContaining([expect.objectContaining({ id: "row-alpha" })]),
  );
  expect(snapshot.dataCount).toBe(0);

  menu = await active.openOptions();
  await menu.item("Delete rows").click();
  await confirmation.getByRole("button", { name: "Delete" }).click();
  await expect(table.row("Alpha")).toHaveCount(0);
  await expect(table.controlledState()).toContainText(
    '"type":"data.row.delete"',
  );
  await expect(table.controlledState()).toContainText(
    '"rowIds":["row-alpha"]',
  );
  snapshot = await table.controlledSnapshot();
  expect(snapshot.data).not.toEqual(
    expect.arrayContaining([expect.objectContaining({ id: "row-alpha" })]),
  );

  settings = await table.openSettings();
  grouping = await settings.openGrouping();
  await grouping.remove();
});

test("GroupActions_LockedView_HidesMutationControls", async ({ page }) => {
  const table = await TableViewObject.open(page, "controlled");
  await groupByStatus(table);

  const settings = await table.openSettings();
  await settings.toggleLock();
  await page.keyboard.press("Escape");
  const active = table.group("status:Active");
  await active.hover();
  await expect(
    active.getByRole("button", { name: "Group options" }),
  ).toHaveCount(0);
  await expect(active.getByRole("button", { name: "Add row" })).toHaveCount(
    0,
  );
});
