import { TableViewObject } from "./component-objects/table-view";
import { expect, test } from "./fixtures";

test("Search_NonTitleQueryClearAndCollapse_RemainsTransient", async ({
  page,
}) => {
  const table = await TableViewObject.open(page, "controlled");
  const search = await table.openSearch();

  await search.fill("alpha@example.com");
  await expect(table.rowTitles()).toHaveCount(1);
  await expect(table.row("Alpha")).toBeVisible();

  await table.searchButton().click();
  await table.openSearch();
  await expect(table.searchInput()).toHaveValue("alpha@example.com");

  await page.getByRole("button", { name: "Clear input", exact: true }).click();
  await expect(table.rowTitles()).toHaveCount(3);

  const state = await table.controlledSnapshot();
  expect(state.viewCount).toBe(0);
  expect(state.lastViewAction).toBeNull();
});
