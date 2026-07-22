import { TableViewObject } from "./component-objects/table-view";
import { expect, test } from "./fixtures";

test("RowActionMenu_SearchAndConfiguredOpen_ExposeOnlyImplementedJourneys", async ({
  page,
}) => {
  const table = await TableViewObject.open(page, "controlled");
  const actions = await table.openRowActions("Alpha");

  await expect(actions.searchInput()).toBeVisible();
  await expect(actions.option("Edit icon")).toBeVisible();
  await expect(actions.option("Open in side peek")).toBeVisible();
  await expect(actions.option("Open in new tab")).toBeVisible();
  await expect(actions.option("Copy link")).toBeVisible();
  await expect(actions.option("Duplicate")).toBeVisible();
  await expect(actions.option("Delete")).toBeVisible();

  await actions.search("duplicate");
  await expect(actions.option("Duplicate")).toBeVisible();
  await expect(actions.option("Copy link")).toHaveCount(0);
  await actions.search("");
  await actions.openRow();

  await expect(page.getByRole("dialog", { name: "Alpha" })).toBeVisible();
  await expect(table.controlledState()).toContainText(
    '"type":"view.opened_row.change"',
  );
  await expect(table.controlledState()).toContainText(
    '"nextRowId":"row-alpha"',
  );
});

test("RowAddButton_ClickAndOptionClick_InsertBelowAndAbove", async ({
  page,
}) => {
  const table = await TableViewObject.open(page, "controlled");
  let alpha = table.row("Alpha");
  await alpha.hover();
  await alpha.getByRole("button", { name: "Add row" }).click();
  await expect(table.rows()).toHaveCount(4);
  await expect(table.controlledState()).toContainText(
    '"type":"data.row.create"',
  );
  await expect(table.controlledState()).toContainText('"nextPosition":1');

  await page.getByRole("button", { name: "Reset controlled state" }).click();
  alpha = table.row("Alpha");
  await alpha.hover();
  await alpha
    .getByRole("button", { name: "Add row" })
    .click({ modifiers: ["Alt"] });
  await expect(table.rows()).toHaveCount(4);
  await expect(table.controlledState()).toContainText('"nextPosition":0');
});

test("RowActionMenu_DuplicateDeleteAndShortcuts_TargetOnlySelectedRows", async ({
  page,
}) => {
  const table = await TableViewObject.open(page, "controlled");

  await (await table.openRowActions("Alpha")).duplicate();
  await expect(table.row("Alpha")).toHaveCount(2);
  await expect(table.controlledState()).toContainText(
    '"type":"data.row.duplicate"',
  );
  await expect(table.controlledState()).toContainText(
    '"sourceRowId":"row-alpha"',
  );

  await (await table.openRowActions("Omega")).delete();
  await expect(table.row("Omega")).toHaveCount(0);
  await expect(table.controlledState()).toContainText(
    '"type":"data.row.delete"',
  );
  await expect(table.controlledState()).toContainText(
    '"rowIds":["row-omega"]',
  );

  const shortcutActions = await table.openRowActions("Empty");
  await shortcutActions.press("Meta+d");
  await expect(table.row("Empty")).toHaveCount(2);
  await expect(table.controlledState()).toContainText(
    '"type":"data.row.duplicate"',
  );
});

test("RowActionMenu_NewTabAndCopyLink_UseDeterministicRowUrl", async ({
  page,
  context,
}) => {
  const table = await TableViewObject.open(page, "controlled");
  const popupPromise = page.waitForEvent("popup");
  await (await table.openRowActions("Alpha")).openInNewTab();
  const popup = await popupPromise;
  await expect(popup).toHaveURL(/\/table-view\/rows\/row-alpha$/);
  await popup.close();

  await context.grantPermissions(["clipboard-read", "clipboard-write"], {
    origin: "http://127.0.0.1:3001",
  });
  await (await table.openRowActions("Omega")).copyLink();
  await expect
    .poll(() => page.evaluate(() => navigator.clipboard.readText()))
    .toBe("http://127.0.0.1:3001/table-view/rows/row-omega");
});

test("RowActionMenu_IconUrlAndRemove_UpdateOnlyTheTargetRow", async ({
  page,
}) => {
  const table = await TableViewObject.open(page, "controlled");
  let actions = await table.openRowActions("Alpha");
  await actions.editIcon();
  await page.getByRole("tab", { name: "Upload" }).click();
  const iconUrl = page.getByPlaceholder("Paste an image link...");
  await iconUrl.fill("https://example.com/alpha-icon.png");
  await iconUrl.blur();
  await expect(page.getByAltText("Preview dark")).toBeVisible();
  await page.getByRole("button", { name: "Submit" }).click();
  await expect(table.controlledState()).toContainText(
    '"type":"data.row.update"',
  );
  await expect(table.controlledState()).toContainText(
    '"src":"https://example.com/alpha-icon.png"',
  );

  await page.keyboard.press("Escape");
  await page.keyboard.press("Escape");
  actions = await table.openRowActions("Alpha");
  await actions.editIcon();
  await page.getByRole("button", { name: "Remove" }).click();
  await expect(table.controlledState()).toContainText(
    '"type":"data.row.update"',
  );
  const snapshot = await table.controlledSnapshot();
  expect(snapshot.lastDataAction).toMatchObject({
    type: "data.row.update",
    payload: { rowId: "row-alpha", next: {} },
  });
  expect(
    snapshot.data.find((row: { id: string }) => row.id === "row-alpha"),
  ).not.toHaveProperty("icon");
});
