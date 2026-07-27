import { TableViewObject } from "./component-objects/table-view";
import { expect, test } from "./fixtures";

test("TableViewObject_ToolbarAndRows_ResolveByAccessibleContract", async ({
  page,
}) => {
  const table = await TableViewObject.open(page, "uncontrolled");

  await expect(table.table()).toBeVisible();
  await expect(table.row("Alpha")).toBeVisible();
  await expect(table.settingsButton()).toBeEnabled();
  await expect(table.sortButton()).toBeEnabled();
});
