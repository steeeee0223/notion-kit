import { TableViewObject } from "./component-objects/table-view";
import { expect, test } from "./fixtures";

test("ControlledData_CellEdits_ParentStateAndUIStaySynchronized", async ({
  page,
}) => {
  const table = await TableViewObject.open(page, "controlled");
  await table.editTextCell("Alpha", "first note", "updated note");

  await expect(table.row("Alpha")).toContainText("updated note");
  await expect(table.controlledState()).toContainText(
    '"type":"data.cell.update"',
  );
  await expect(table.controlledState()).toContainText('"rowId":"row-alpha"');
  await expect(table.controlledState()).toContainText('"propertyId":"notes"');
  await expect(table.controlledState()).toContainText(
    '"nextValue":"updated note"',
  );
});

test("ControlledResources_ParentReset_RestoresAllInitialResources", async ({
  page,
}) => {
  const table = await TableViewObject.open(page, "controlled");
  await table.editTextCell("Alpha", "first note", "changed");
  await expect(table.row("Alpha")).toContainText("changed");
  await page.getByRole("button", { name: "Reset controlled state" }).click();

  await expect(table.row("Alpha")).toContainText("first note");
  await expect(table.controlledState()).toContainText('"dataCount":0');
  await expect(table.controlledState()).toContainText('"propertiesCount":0');
  await expect(table.controlledState()).toContainText('"viewCount":0');
});

test("ControlledProperties_CreateRenameHideDeleteRestore_ParentAndHeadersStaySynchronized", async ({
  page,
}) => {
  const table = await TableViewObject.open(page, "controlled");
  const settings = await table.openSettings();
  let properties = await settings.openProperties();

  await properties.visibilityButton("Notes").click();
  await expect(table.header("Notes")).toHaveCount(0);
  await expect(table.controlledState()).toContainText(
    '"type":"properties.visibility.change"',
  );

  const editor = await properties.createTextProperty("Browser property");
  await expect(table.header("Browser property")).toBeVisible();
  await expect(table.controlledState()).toContainText(
    '"type":"properties.create"',
  );

  const name = editor.root.getByRole("textbox").first();
  await name.fill("Renamed browser property");
  await name.press("Enter");
  await expect(table.header("Renamed browser property")).toBeVisible();
  await expect(table.controlledState()).toContainText(
    '"type":"properties.update"',
  );

  await editor.item("Delete property").click();
  await expect(table.header("Renamed browser property")).toHaveCount(0);
  await expect(table.controlledState()).toContainText(
    '"type":"properties.delete"',
  );

  properties = await (await table.openSettings()).openProperties();
  const deleted = await properties.openDeletedProperties();
  await deleted.root
    .getByRole("button", { name: "Restore Renamed browser property" })
    .click();
  await expect(table.header("Renamed browser property")).toBeVisible();
  await expect(table.controlledState()).toContainText(
    '"type":"properties.restore"',
  );
});

test("ControlledView_LayoutLockRowViewAndOpenedRow_ParentStateStaysSynchronized", async ({
  page,
}) => {
  const table = await TableViewObject.open(page, "controlled");
  const settings = await table.openSettings();
  const layout = await settings.openLayout();

  await layout.button("List").click();
  await expect(table.controlledState()).toContainText(
    '"type":"view.layout.change"',
  );
  await expect(table.controlledState()).toContainText('"layout":"list"');

  await layout.item(/Open pages in/i).hover();
  await page.getByRole("menuitemcheckbox", { name: "Center peek" }).click();
  await expect(table.controlledState()).toContainText(
    '"type":"view.row_display.change"',
  );
  await expect(table.controlledState()).toContainText('"rowView":"center"');

  await layout.button("Table").click();
  await layout.close();
  const alpha = table.row("Alpha");
  await alpha.hover();
  await alpha
    .getByRole("button", { name: "Open in center peek", exact: true })
    .click();
  await expect(table.controlledState()).toContainText(
    '"type":"view.opened_row.change"',
  );
  await expect(table.controlledState()).toContainText(
    '"openedRowId":"row-alpha"',
  );
  await page.keyboard.press("Escape");
  await expect(table.controlledState()).toContainText('"openedRowId":null');

  const lockSettings = await table.openSettings();
  await lockSettings.toggleLock();
  await expect(table.controlledState()).toContainText(
    '"type":"view.lock.change"',
  );
  await expect(table.controlledState()).toContainText('"locked":true');
  await expect(page.getByRole("button", { name: "Add row" })).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Row actions" }),
  ).toHaveCount(0);
});
