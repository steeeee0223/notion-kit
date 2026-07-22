import { expect, test } from "./fixtures";
import { TableViewObject } from "./component-objects/table-view";

async function expectRowOrder(table: TableViewObject, names: string[]) {
  const titles = table.rowTitles();
  await expect(titles).toHaveCount(names.length);
  for (const [index, name] of names.entries()) {
    await expect(titles.nth(index)).toHaveAccessibleName(name);
  }
}

test("Sorting_RulesEditsAndRemoval_UpdateRowsWithoutParentViewWriteback", async ({
  page,
}) => {
  const table = await TableViewObject.open(page, "controlled");
  const sort = await table.openSort();

  await sort.add("Score");
  await expectRowOrder(table, ["Alpha", "Omega", "Empty"]);
  await expect(table.internalState()).toContainText(
    '"sorting":[{"id":"score","desc":false}]',
  );
  await expect(table.controlledState()).toContainText('"viewCount":0');
  await expect(table.controlledState()).toContainText(
    '"lastViewAction":null',
  );

  await sort.setDirection("Ascending", "Descending");
  await expectRowOrder(table, ["Omega", "Alpha", "Empty"]);

  await sort.add("Name");
  await expectRowOrder(table, ["Omega", "Alpha", "Empty"]);
  await expect(table.internalState()).toContainText(
    '"sorting":[{"id":"score","desc":true},{"id":"title","desc":false}]',
  );

  await sort.deleteAll();
  await expectRowOrder(table, ["Alpha", "Empty", "Omega"]);

  await sort.add("Score");
  await sort.setDirection("Ascending", "Descending");
  await page.keyboard.press("Escape");
  await table.cellEditor("Alpha", "10").fill("100");
  await expectRowOrder(table, ["Alpha", "Omega", "Empty"]);
  await expect(table.controlledState()).toContainText(
    '"type":"data.cell.update"',
  );

  const updatedSort = await table.openSort();
  await updatedSort.remove("Score");
  await expectRowOrder(table, ["Alpha", "Empty", "Omega"]);
  await expect(table.internalState()).toContainText('"sorting":[]');
});
