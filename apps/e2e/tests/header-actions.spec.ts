import { TableViewObject } from "./component-objects/table-view";
import { MenuSurfaceObject } from "./component-objects/menu-surface";
import { expect, test } from "./fixtures";

async function propertyNames(table: TableViewObject) {
  const snapshot = await table.controlledSnapshot();
  return snapshot.properties.map((property: { name: string }) => property.name);
}

async function expectRowOrder(table: TableViewObject, names: string[]) {
  const titles = table.rowTitles();
  await expect(titles).toHaveCount(names.length);
  for (const [index, name] of names.entries()) {
    await expect(titles.nth(index)).toHaveAccessibleName(name);
  }
}

async function createPropertyFromOpenTypeMenu(
  table: TableViewObject,
  name: string,
) {
  const menu = MenuSurfaceObject.withHeading(table.page, "New property");
  const input = menu.root.getByPlaceholder("Search or add new property");
  await input.fill(name);
  await menu.root.getByRole("option", { name, exact: true }).click();
  return MenuSurfaceObject.withHeading(table.page, "Edit property");
}

test("HeaderActions_WrapFreezeAndHide_ReflectActualTableState", async ({
  page,
}) => {
  const table = await TableViewObject.open(page, "controlled");

  let header = await table.openHeader("Notes");
  await header.toggleWrap();
  await expect(table.controlledState()).toContainText(
    '"type":"properties.update"',
  );
  await expect(table.controlledState()).toContainText('"wrapped":true');

  header = await table.openHeader("Notes");
  await expect(header.item("Unwrap text")).toBeVisible();
  await header.toggleWrap();
  await expect(table.controlledState()).toContainText('"wrapped":false');

  header = await table.openHeader("Notes");
  await header.toggleFreeze();
  await expect(
    page.locator("#draggable-ghost-section-left").getByRole("button", {
      name: "Notes",
      exact: true,
    }),
  ).toBeVisible();
  header = await table.openHeader("Notes");
  await expect(header.item("Unfreeze columns")).toBeVisible();
  await header.toggleFreeze();

  header = await table.openHeader("Notes");
  await header.hide();
  await expect(table.header("Notes")).toHaveCount(0);
  await expect(table.controlledState()).toContainText(
    '"type":"properties.visibility.change"',
  );

  const properties = await (await table.openSettings()).openProperties();
  await properties.visibilityButton("Notes").click();
  await expect(table.header("Notes")).toBeVisible();
});

test("HeaderActions_InsertLeftAndRight_PreserveRequestedPropertyOrder", async ({
  page,
}) => {
  const table = await TableViewObject.open(page, "controlled");

  await (await table.openHeader("Notes")).insert("left");
  let editor = await createPropertyFromOpenTypeMenu(table, "Inserted left");
  await editor.close();
  await expect.poll(() => propertyNames(table)).toEqual([
    "Name",
    "Inserted left",
    "Notes",
    "Score",
    "Status",
    "Tags",
    "Complete",
    "Due",
    "Email",
    "Phone",
    "Website",
    "Created",
    "Edited",
  ]);

  await (await table.openHeader("Notes")).insert("right");
  editor = await createPropertyFromOpenTypeMenu(table, "Inserted right");
  await editor.close();
  await expect.poll(() => propertyNames(table)).toEqual([
    "Name",
    "Inserted left",
    "Notes",
    "Inserted right",
    "Score",
    "Status",
    "Tags",
    "Complete",
    "Due",
    "Email",
    "Phone",
    "Website",
    "Created",
    "Edited",
  ]);
  await expect(table.controlledState()).toContainText(
    '"type":"properties.create"',
  );
});

test("HeaderActions_DuplicateDeleteAndRestore_KeepTargetIdentity", async ({
  page,
}) => {
  const table = await TableViewObject.open(page, "controlled");

  await (await table.openHeader("Notes")).duplicate();
  await expect(table.header("Notes 1")).toBeVisible();
  await expect(table.controlledState()).toContainText(
    '"type":"properties.duplicate"',
  );
  await expect(table.controlledState()).toContainText(
    '"sourcePropertyId":"notes"',
  );

  await (await table.openHeader("Notes 1")).delete();
  await expect(table.header("Notes 1")).toHaveCount(0);
  await expect(table.controlledState()).toContainText(
    '"type":"properties.delete"',
  );

  const properties = await (await table.openSettings()).openProperties();
  const deleted = await properties.openDeletedProperties();
  await deleted.root.getByRole("button", { name: "Restore Notes 1" }).click();
  await expect(table.header("Notes 1")).toBeVisible();
  await expect(table.controlledState()).toContainText(
    '"type":"properties.restore"',
  );
});

test("HeaderActions_TitleAndLockedView_BlockDestructiveHeaderChanges", async ({
  page,
}) => {
  const table = await TableViewObject.open(page, "controlled");

  const titleMenu = await table.openHeader("Name");
  await expect(titleMenu.item("Change type")).toHaveCount(0);
  await expect(titleMenu.item("Duplicate property")).toHaveCount(0);
  await expect(titleMenu.item("Delete property")).toHaveCount(0);
  await page.keyboard.press("Escape");

  await (await table.openSettings()).toggleLock();
  await expect(table.header("Notes")).toBeDisabled();
  await table.header("Notes").click({ force: true });
  await expect(page.getByRole("menu")).toHaveCount(0);
});

test("HeaderMenu_SortGroupAndChangeType_ApplyResultBearingActions", async ({
  page,
}) => {
  const table = await TableViewObject.open(page, "controlled");

  let header = await table.openHeader("Notes");
  await expect(header.item("Calculate")).toBeVisible();
  await header.sort("ascending");
  await expectRowOrder(table, ["Empty", "Alpha", "Omega"]);
  await (await table.openSort()).deleteAll();
  await page.keyboard.press("Escape");

  header = await table.openHeader("Status");
  await header.group();
  await expect(table.group("status:Active")).toBeVisible();
  await expect(table.group("status:Done")).toBeVisible();
  header = await table.openHeader("Status");
  await expect(header.item("Ungroup")).toBeVisible();
  await header.group();
  await expect(page.getByRole("group", { name: /^Group / })).toHaveCount(0);

  header = await table.openHeader("Notes");
  const editor = await header.changeType("Number");
  await editor.close();
  await expect(table.controlledState()).toContainText(
    '"type":"properties.type.change"',
  );
  await expect(table.controlledState()).toContainText(
    '"propertyId":"notes"',
  );
  await expect(table.controlledState()).toContainText(
    '"nextType":"number"',
  );
  await expect(table.header("Notes")).toBeVisible();
});
