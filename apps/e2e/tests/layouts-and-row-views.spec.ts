import { TableViewObject } from "./component-objects/table-view";
import { expect, test } from "./fixtures";

test("Layouts_TableListBoard_PreserveEditedDataAcrossViewChanges", async ({
  page,
}) => {
  const table = await TableViewObject.open(page, "controlled");
  await table.editTextCell("Alpha", "first note", "preserved note");

  let layout = await (await table.openSettings()).openLayout();
  await layout.button("List").click();
  await expect(page.getByText("preserved note", { exact: true })).toBeVisible();
  await expect(table.controlledState()).toContainText('"layout":"list"');
  await layout.close();

  layout = await (await table.openSettings()).openLayout();
  await layout.button("Table").click();
  await layout.close();
  const grouping = await (await table.openSettings()).openGrouping();
  await grouping.choose("Status");
  await page.keyboard.press("Escape");

  layout = await (await table.openSettings()).openLayout();
  await layout.button("Board").click();
  await expect(
    table.group("status:Active").getByText("preserved note", { exact: true }),
  ).toBeVisible();
  await expect(table.controlledState()).toContainText('"layout":"board"');
  await layout.close();

  layout = await (await table.openSettings()).openLayout();
  await layout.button("Table").click();
  await layout.close();
  await table.expandGroup("status:Active");
  await expect(page.getByText("preserved note", { exact: true })).toBeVisible();
  const snapshot = await table.controlledSnapshot();
  expect(snapshot.dataCount).toBe(1);
  expect(snapshot.view.layout).toBe("table");
});

test("RowViews_SideCenterAndFull_UseConfiguredDisplayBoundary", async ({
  page,
}) => {
  const table = await TableViewObject.open(page, "controlled");

  await (await table.openRowActions("Alpha")).openRow();
  await expect(page.getByRole("dialog", { name: "Alpha" })).toBeVisible();
  await expect(table.controlledState()).toContainText('"rowView":"side"');
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog", { name: "Alpha" })).toHaveCount(0);

  let layout = await (await table.openSettings()).openLayout();
  await layout.item(/Open pages in/i).hover();
  await page.getByRole("menuitemcheckbox", { name: "Center peek" }).click();
  await layout.close();
  await (await table.openRowActions("Omega")).openRow();
  await expect(page.getByRole("dialog", { name: "Omega" })).toBeVisible();
  await expect(table.controlledState()).toContainText('"rowView":"center"');
  await page.keyboard.press("Escape");

  layout = await (await table.openSettings()).openLayout();
  await layout.item(/Open pages in/i).hover();
  await page.getByRole("menuitemcheckbox", { name: "Full page" }).click();
  await layout.close();
  await (await table.openRowActions("Empty")).openRow();
  await expect(page).toHaveURL(/\/table-view\/rows\/row-empty$/);
});

test("RowViews_PreviousNextAndClose_RespectNavigationBoundaries", async ({
  page,
}) => {
  const table = await TableViewObject.open(page, "controlled");
  await (await table.openRowActions("Alpha")).openRow();
  let dialog = page.getByRole("dialog", { name: "Alpha" });

  await expect(
    dialog.getByRole("button", { name: "Previous row" }),
  ).toBeDisabled();
  await dialog.getByRole("button", { name: "Next row" }).click();
  dialog = page.getByRole("dialog", { name: "Empty" });
  await expect(dialog).toBeVisible();
  expect((await table.controlledSnapshot()).lastViewAction).toMatchObject({
    type: "view.opened_row.change",
    payload: {
      previousRowId: "row-alpha",
      nextRowId: "row-empty",
    },
  });

  await dialog.getByRole("button", { name: "Next row" }).click();
  dialog = page.getByRole("dialog", { name: "Omega" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("button", { name: "Next row" })).toBeDisabled();
  await dialog.getByRole("button", { name: "Previous row" }).click();
  await expect(page.getByRole("dialog", { name: "Empty" })).toBeVisible();

  await page.getByRole("button", { name: "Close row" }).click();
  await expect(page.getByRole("dialog", { name: "Empty" })).toHaveCount(0);
  const snapshot = await table.controlledSnapshot();
  expect(snapshot.view.openedRowId).toBeNull();
  expect(snapshot.lastViewAction).toMatchObject({
    type: "view.opened_row.change",
    payload: {
      previousRowId: "row-empty",
      nextRowId: null,
    },
  });
  await expect(page).toHaveURL(/\/table-view\/controlled$/);
});
