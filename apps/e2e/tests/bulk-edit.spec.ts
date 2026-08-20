import { TableViewObject } from "./component-objects/table-view";
import { expect, test } from "./fixtures";

async function selectRows(table: TableViewObject, ...rowIds: string[]) {
  for (const rowId of rowIds) {
    await table.rowCheckbox(rowId).click();
  }
}

test("BulkEdit_SelectedRows_OverwritesValuesAndPersistsAcrossTimeline", async ({
  page,
}) => {
  const table = await TableViewObject.open(page, "controlled");
  await selectRows(table, "row-alpha", "row-empty");

  const bar = table.bulkEditBar();
  await expect(bar).toBeVisible();
  await expect(bar.getByText("2 rows selected", { exact: true })).toBeVisible();
  await expect(bar.getByRole("button", { name: "Name" })).toHaveCount(0);
  await expect(bar.getByRole("button", { name: "Created" })).toHaveCount(0);
  await expect(bar.getByRole("button", { name: "Edited" })).toHaveCount(0);

  const complete = bar.getByRole("button", { name: "Complete" });
  await complete.click();

  const completionSnapshot = await table.controlledSnapshot();
  expect(completionSnapshot.lastDataAction).toMatchObject({
    type: "data.cell.update",
    payload: { rowIds: ["row-alpha", "row-empty"], propertyId: "complete" },
  });
  expect(
    completionSnapshot.data.find((row) => row.id === "row-alpha")?.properties
      .complete?.value,
  ).toBe(true);
  expect(
    completionSnapshot.data.find((row) => row.id === "row-empty")?.properties
      .complete?.value,
  ).toBe(true);

  await bar.getByRole("button", { name: "Tags" }).click();
  await page.getByRole("option", { name: /Backend$/ }).click();

  await expect(table.row("Alpha")).toContainText("Backend");
  await expect(table.row("Alpha")).not.toContainText("Frontend");
  const snapshot = await table.controlledSnapshot();
  expect(snapshot.lastDataAction).toMatchObject({
    type: "data.cell.update",
    payload: { rowIds: ["row-alpha", "row-empty"], propertyId: "tags" },
  });
  expect(
    snapshot.data.find((row) => row.id === "row-alpha")?.properties.tags?.value,
  ).toEqual(["Backend"]);
  expect(
    snapshot.data.find((row) => row.id === "row-empty")?.properties.tags?.value,
  ).toEqual(["Backend"]);

  await table.setLayout("timeline");
  await expect(bar).toBeVisible();
  await expect(bar).toHaveCSS("position", "sticky");
});

test("BulkEdit_Duplicate_CreatesOneBatchForOnlySelectedRows", async ({
  page,
}) => {
  const table = await TableViewObject.open(page, "controlled");
  await selectRows(table, "row-alpha", "row-empty");

  const bar = table.bulkEditBar();
  await bar.getByRole("button", { name: "More bulk actions" }).click();
  await page.getByRole("menuitem", { name: "Duplicate", exact: true }).click();

  const snapshot = await table.controlledSnapshot();
  expect(snapshot.data).toHaveLength(5);
  expect(snapshot.lastDataAction).toMatchObject({
    type: "data.rows.duplicate",
    payload: {
      duplicates: [
        { sourceRowId: "row-alpha", nextPosition: 1 },
        { sourceRowId: "row-empty", nextPosition: 3 },
      ],
    },
  });
});

test("BulkEdit_Delete_RequiresConfirmationAndTargetsOnlySelectedRows", async ({
  page,
}) => {
  const table = await TableViewObject.open(page, "controlled");
  await selectRows(table, "row-alpha", "row-omega");

  const bar = table.bulkEditBar();
  await bar.getByRole("button", { name: "Delete 2 rows" }).click();
  await expect(
    page.getByRole("heading", { name: "Delete 2 rows?" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Cancel" }).click();
  expect((await table.controlledSnapshot()).data).toHaveLength(3);

  await bar.getByRole("button", { name: "More bulk actions" }).click();
  await page.getByRole("menuitem", { name: "Delete", exact: true }).click();
  await page.getByRole("button", { name: "Delete", exact: true }).click();

  await expect(bar).toHaveCount(0);
  const snapshot = await table.controlledSnapshot();
  expect(snapshot.data.map((row) => row.id)).toEqual(["row-empty"]);
  expect(snapshot.lastDataAction).toMatchObject({
    type: "data.row.delete",
    payload: { rowIds: ["row-alpha", "row-omega"] },
  });
});
