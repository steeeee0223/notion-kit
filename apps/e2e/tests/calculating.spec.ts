import { expect, test } from "./fixtures";
import { TableViewObject } from "./component-objects/table-view";

async function setCalculation(
  table: TableViewObject,
  property: string,
  method: string,
) {
  await table.setCalculation(property, method);
}

async function expectCalculation(
  table: TableViewObject,
  property: string,
  label: string,
  value: string,
) {
  const result = table.calculation(property);
  await expect(result).toHaveText(`${label}${value}`);
}

test("Calculating_TextAndCheckboxMethods_RenderExactResults", async ({
  page,
}) => {
  const table = await TableViewObject.open(page, "controlled");

  const textMethods = [
    ["Count all", "count", "3"],
    ["Count values", "values", "2"],
    ["Count unique values", "unique", "2"],
    ["Count empty", "empty", "1"],
    ["Count not empty", "not empty", "2"],
  ] as const;
  for (const [method, label, value] of textMethods) {
    await setCalculation(table, "Notes", method);
    await expectCalculation(table, "Notes", label, value);
  }

  const checkboxMethods = [
    ["Count all", "count", "3"],
    ["Checked", "checked", "1"],
    ["Unchecked", "unchecked", "2"],
    ["Percent checked", "checked", "33.3%"],
  ] as const;
  for (const [method, label, value] of checkboxMethods) {
    await setCalculation(table, "Complete", method);
    await expectCalculation(table, "Complete", label, value);
  }

  await expect(table.internalState()).toContainText(
    '"complete":{"method":"percentage-checked"}',
  );
  await expect(table.controlledState()).toContainText('"viewCount":0');
});

test("Calculating_EditAddAndDelete_RecomputesImmediately", async ({ page }) => {
  const table = await TableViewObject.open(page, "controlled");

  await setCalculation(table, "Notes", "Count values");
  await expectCalculation(table, "Notes", "values", "2");
  await table.cellEditor("Alpha", "first note").fill("");
  await expectCalculation(table, "Notes", "values", "1");

  await setCalculation(table, "Notes", "Count all");
  await table.table().getByRole("button", { name: "New page" }).click();
  await expect(table.rows()).toHaveCount(4);
  await expectCalculation(table, "Notes", "count", "4");

  const addedRowActions = await table.openRowActionsFor(table.rows().last());
  await addedRowActions.delete();
  await expect(table.rows()).toHaveCount(3);
  await expectCalculation(table, "Notes", "count", "3");
});
