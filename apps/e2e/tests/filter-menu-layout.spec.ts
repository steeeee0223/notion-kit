import type { Locator } from "@playwright/test";

import { TableViewObject } from "./component-objects/table-view";
import { expect, test } from "./fixtures";

async function expectEmptyBelowInput(popup: Locator, input: Locator) {
  await input.fill("no-such-property");
  await expect(popup.getByRole("menuitem")).toHaveCount(0);
  const empty = popup.getByRole("status");
  await expect(empty).toHaveText("No results");
  const inputBox = await input.boundingBox();
  const emptyBox = await empty.boundingBox();
  expect(inputBox).not.toBeNull();
  expect(emptyBox).not.toBeNull();
  const gap = emptyBox!.y - (inputBox!.y + inputBox!.height);
  expect(gap).toBeGreaterThanOrEqual(0);
  expect(gap).toBeLessThan(24);
}

test("FilteredMenus_NoMatches_KeepEmptyMessageBelowSearch", async ({
  page,
}) => {
  const table = await TableViewObject.open(page, "controlled");
  const grouping = await (await table.openSettings()).openGrouping();
  await expectEmptyBelowInput(grouping.root, grouping.searchInput());
  await grouping.close();

  const sort = await table.openSort();
  await sort.item("Add sort").click();
  await expectEmptyBelowInput(sort.addPanel(), sort.searchInput());
});

test("FilteredMenus_NoMatchingTypes_HideTypeGroupLabel", async ({ page }) => {
  const table = await TableViewObject.open(page, "controlled");
  const properties = await (await table.openSettings()).openProperties();
  await properties.item("New property").click();
  const popup = page.getByRole("dialog").filter({
    has: page.getByRole("heading", { name: "New property", exact: true }),
  });
  const input = popup.getByRole("searchbox", { name: "Search property types" });
  await expect(popup.getByText("Type", { exact: true })).toBeVisible();
  await input.fill("no-such-property");
  await expect(popup.getByText("Type", { exact: true })).toBeHidden();
  await expect(popup.getByText("Select to add", { exact: true })).toBeVisible();
  await expect(
    popup.getByRole("menuitem", { name: "no-such-property", exact: true }),
  ).toBeVisible();
  await input.fill("");
  await expect(popup.getByText("Type", { exact: true })).toBeVisible();
});
