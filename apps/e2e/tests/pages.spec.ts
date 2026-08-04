import { TableViewObject } from "./component-objects/table-view";
import { expect, test } from "./fixtures";

for (const mode of ["controlled", "uncontrolled"] as const) {
  test(`TableViewPage_${mode}_RendersDeterministicRows`, async ({ page }) => {
    const table = await TableViewObject.open(page, mode);

    await expect(table.row("Alpha")).toBeVisible();
    await expect(table.row("Omega")).toBeVisible();
  });
}

test("ControlledTable_Reset_RestoresParentResources", async ({ page }) => {
  const table = await TableViewObject.open(page, "controlled");

  await expect(table.controlledState()).toContainText('"layout":"table"');
  await expect(table.button("Reset controlled state")).toBeVisible();
});
