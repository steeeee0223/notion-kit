import { expect, test } from "./fixtures";

for (const mode of ["controlled", "uncontrolled"] as const) {
  test(`TableViewPage_${mode}_RendersDeterministicRows`, async ({ page }) => {
    await page.goto(`/table-view/${mode}`);

    await expect(page.getByRole("table")).toBeVisible();
    await expect(
      page.getByRole("row").filter({ hasText: "Alpha" }),
    ).toBeVisible();
    await expect(
      page.getByRole("row").filter({ hasText: "Omega" }),
    ).toBeVisible();
  });
}

test("ControlledTable_Reset_RestoresParentResources", async ({ page }) => {
  await page.goto("/table-view/controlled");

  await expect(page.getByTestId("controlled-state")).toContainText(
    '"layout":"table"',
  );
  await expect(
    page.getByRole("button", { name: "Reset controlled state" }),
  ).toBeVisible();
});
