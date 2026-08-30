import { TableViewObject } from "./component-objects/table-view";
import { expect, test } from "./fixtures";

async function expectRows(table: TableViewObject, names: string[]) {
  await expect(table.rowTitles()).toHaveCount(names.length);
  for (const name of names) {
    await expect(table.row(name)).toBeVisible();
  }
}

test("Filtering_NumericRuleLifecycle_RendersMatchesAndPersistsView", async ({
  page,
}) => {
  const table = await TableViewObject.open(page, "controlled");
  const filter = await table.openFilter();

  await filter.addRule();
  await filter.chooseProperty("Score");
  await filter.chooseOperator("Greater than");
  await filter.value().fill("50");
  await filter.value().press("Tab");

  await expectRows(table, ["Omega"]);
  await expect(
    page.getByRole("button", { name: "1 rule", exact: true }),
  ).toBeVisible();
  expect((await table.controlledSnapshot()).lastViewAction).toMatchObject({
    type: "view.filters.change",
    payload: {
      nextFilters: {
        kind: "group",
        children: [
          {
            kind: "rule",
            propertyId: "score",
            operator: "greater-than",
            value: 50,
          },
        ],
      },
    },
  });

  await filter.delete();

  await expectRows(table, ["Alpha", "Empty", "Omega"]);
  expect((await table.controlledSnapshot()).view.filters).toBeNull();
});

test("Filtering_OptionRuleAndSearch_ComposeAsAndConditions", async ({
  page,
}) => {
  const table = await TableViewObject.open(page, "controlled");
  const filter = await table.openFilter();

  await filter.addRule();
  await filter.chooseProperty("Status");
  await filter.chooseValue("Done");
  await expectRows(table, ["Omega"]);

  const viewCountBeforeSearch = (await table.controlledSnapshot()).viewCount;
  const search = await table.openSearch();
  await search.fill("last note");
  await expectRows(table, ["Omega"]);

  await search.fill("first note");
  await expectRows(table, []);

  await page.getByRole("button", { name: "Clear input", exact: true }).click();
  await expectRows(table, ["Omega"]);
  expect((await table.controlledSnapshot()).viewCount).toBe(
    viewCountBeforeSearch,
  );
});
