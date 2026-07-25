import { expect, test } from "./fixtures";
import { TableViewObject } from "./component-objects/table-view";

test("UncontrolledState_ConsecutiveEditsAndLayoutChanges_PersistWithoutParentWriteback", async ({
  page,
}) => {
  const table = await TableViewObject.open(page, "uncontrolled");
  await table.editTextCell("Alpha", "first note", "persisted note");
  await table.editTextCell("Omega", "last note", "persisted last note");

  const settings = await table.openSettings();
  const layout = await settings.openLayout();
  await layout.button("List").click();

  await expect(page.getByText("persisted note", { exact: true })).toBeVisible();
  await expect(
    page.getByText("persisted last note", { exact: true }),
  ).toBeVisible();
  await expect(page.getByTestId("controlled-state")).toHaveCount(0);

  await layout.close();
  const listSettings = await table.openSettings();
  const listLayout = await listSettings.openLayout();
  await listLayout.button("Table").click();
  await expect(table.row("Alpha")).toContainText("persisted note");
  await expect(table.row("Omega")).toContainText("persisted last note");
});

test("UncontrolledState_PageReload_RestoresDeterministicDefaults", async ({
  page,
}) => {
  const table = await TableViewObject.open(page, "uncontrolled");
  await table.editTextCell("Alpha", "first note", "temporary note");
  await expect(table.row("Alpha")).toContainText("temporary note");

  await page.reload();

  await expect(table.row("Alpha")).toContainText("first note");
  await expect(table.row("Alpha")).not.toContainText("temporary note");
  await expect(table.row("Empty")).toBeVisible();
  await expect(table.row("Omega")).toBeVisible();
});
