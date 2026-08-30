import { TableViewObject } from "./component-objects/table-view";
import { expect, test } from "./fixtures";

for (const layout of ["table", "list", "board"] as const) {
  test(`RowViewEntry_${layout}_PrimarySurfaceOpensConfiguredView`, async ({
    page,
  }) => {
    const table = await TableViewObject.open(page, "controlled");
    if (layout === "board") {
      await table.groupBy("Status");
      await table.setLayout(layout);
    } else if (layout === "list") {
      await table.setLayout(layout);
    }

    await table.openPrimaryRow(layout, { id: "row-alpha", name: "Alpha" });

    await expect(page.getByRole("dialog", { name: "Alpha" })).toBeVisible();
    const snapshot = await table.controlledSnapshot();
    expect(snapshot.view.openedRowId).toBe("row-alpha");
    expect(snapshot.lastViewAction).toEqual({
      id: expect.any(String),
      type: "view.opened_row.change",
      payload: {
        previousRowId: null,
        nextRowId: "row-alpha",
        previousRowView: "side",
        nextRowView: "side",
      },
    });
  });
}

test("LockedRowView_PropertyTriggersRemainClosedAndDataUnchanged", async ({
  page,
}) => {
  const table = await TableViewObject.open(page, "controlled");
  await page.getByRole("button", { name: "Open locked Alpha row" }).click();
  let dialog = page.getByRole("dialog", { name: "Alpha" });
  await expect(dialog).toBeVisible();

  for (const propertyName of [
    "Notes",
    "Score",
    "Status",
    "Tags",
    "Complete",
    "Due",
    "Email",
    "Phone",
    "Website",
    "Created",
    "Edited",
  ]) {
    await expect(
      table.rowViewPropertyLabel(dialog, propertyName),
    ).toBeDisabled();
    if (propertyName === "Complete") {
      await expect(
        table.rowViewPropertyCheckboxTrigger(dialog, propertyName),
      ).toHaveAttribute("aria-disabled", "true");
      continue;
    }
    const value = table.rowViewPropertyValue(dialog, propertyName);
    await expect(value).toHaveAttribute("aria-disabled", "true");
    await expect(value).toHaveAttribute("tabindex", "-1");
  }

  await table.rowViewPropertyLabel(dialog, "Notes").dispatchEvent("click");
  await table.rowViewPropertyValue(dialog, "Notes").dispatchEvent("click");
  await table.rowViewPropertyValue(dialog, "Status").dispatchEvent("click");
  await table
    .rowViewPropertyCheckboxTrigger(dialog, "Complete")
    .dispatchEvent("click");
  await table.rowViewPropertyValue(dialog, "Due").dispatchEvent("click");

  await expect(page.getByRole("menu")).toHaveCount(0);
  await expect(page.getByRole("listbox")).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Go to the Next Month" }),
  ).toHaveCount(0);
  await expect(dialog.getByRole("textbox")).toHaveCount(0);
  let snapshot = await table.controlledSnapshot();
  expect(snapshot.dataCount).toBe(0);
  expect(snapshot.propertiesCount).toBe(0);
  expect(snapshot.lastDataAction).toBeNull();
  expect(snapshot.lastPropertiesAction).toBeNull();

  await dialog.getByRole("button", { name: "Next row" }).click();
  dialog = page.getByRole("dialog", { name: "Empty" });
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: "Previous row" }).click();
  dialog = page.getByRole("dialog", { name: "Alpha" });
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: "Close row" }).click();
  await expect(dialog).toHaveCount(0);
  snapshot = await table.controlledSnapshot();
  expect(snapshot.view.locked).toBe(true);
  expect(snapshot.view.openedRowId).toBeNull();
});

test("Layouts_TableListBoard_PreserveEditedDataAcrossViewChanges", async ({
  page,
}) => {
  const table = await TableViewObject.open(page, "controlled");
  await table.editTextCell("Alpha", "first note", "preserved note");

  let layout = await (await table.openSettings()).openLayout();
  await layout.button("List").click();
  await expect(page.getByText("preserved note", { exact: true })).toBeVisible();
  await expect(table.controlledState()).toContainText('"layout":"list"');
  await layout.close();

  layout = await (await table.openSettings()).openLayout();
  await layout.button("Table").click();
  await layout.close();
  const grouping = await (await table.openSettings()).openGrouping();
  await grouping.choose("Status");
  await page.keyboard.press("Escape");

  layout = await (await table.openSettings()).openLayout();
  await layout.button("Board").click();
  await expect(
    table.group("status:Active").getByText("preserved note", { exact: true }),
  ).toBeVisible();
  await expect(table.controlledState()).toContainText('"layout":"board"');
  await layout.close();

  layout = await (await table.openSettings()).openLayout();
  await layout.button("Table").click();
  await layout.close();
  await table.expandGroup("status:Active");
  await expect(page.getByText("preserved note", { exact: true })).toBeVisible();
  const snapshot = await table.controlledSnapshot();
  expect(snapshot.dataCount).toBe(1);
  expect(snapshot.view.layout).toBe("table");
});

test("RowViews_SideCenterAndFull_UseConfiguredDisplayBoundary", async ({
  page,
}) => {
  const table = await TableViewObject.open(page, "controlled");

  await (await table.openRowActions("Alpha")).openRow();
  await expect(page.getByRole("dialog", { name: "Alpha" })).toBeVisible();
  await expect(table.controlledState()).toContainText('"rowView":"side"');
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog", { name: "Alpha" })).toHaveCount(0);

  let layout = await (await table.openSettings()).openLayout();
  await layout.item(/Open pages in/i).hover();
  await page.getByRole("menuitemradio", { name: "Center peek" }).click();
  await layout.close();
  await (await table.openRowActions("Omega")).openRow();
  await expect(page.getByRole("dialog", { name: "Omega" })).toBeVisible();
  await expect(table.controlledState()).toContainText('"rowView":"center"');
  await page.keyboard.press("Escape");

  layout = await (await table.openSettings()).openLayout();
  await layout.item(/Open pages in/i).hover();
  await page.getByRole("menuitemradio", { name: "Full page" }).click();
  await layout.close();
  await (await table.openRowActions("Empty")).openRow();
  await expect(page).toHaveURL(/\/table-view\/rows\/row-empty$/);
});

test("RowViews_PreviousNextAndClose_RespectNavigationBoundaries", async ({
  page,
}) => {
  const table = await TableViewObject.open(page, "controlled");
  await (await table.openRowActions("Alpha")).openRow();
  let dialog = page.getByRole("dialog", { name: "Alpha" });

  await expect(
    dialog.getByRole("button", { name: "Previous row" }),
  ).toBeDisabled();
  await dialog.getByRole("button", { name: "Next row" }).click();
  dialog = page.getByRole("dialog", { name: "Empty" });
  await expect(dialog).toBeVisible();
  expect((await table.controlledSnapshot()).lastViewAction).toMatchObject({
    type: "view.opened_row.change",
    payload: {
      previousRowId: "row-alpha",
      nextRowId: "row-empty",
    },
  });

  await dialog.getByRole("button", { name: "Next row" }).click();
  dialog = page.getByRole("dialog", { name: "Omega" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("button", { name: "Next row" })).toBeDisabled();
  await dialog.getByRole("button", { name: "Previous row" }).click();
  await expect(page.getByRole("dialog", { name: "Empty" })).toBeVisible();

  await page.getByRole("button", { name: "Close row" }).click();
  await expect(page.getByRole("dialog", { name: "Empty" })).toHaveCount(0);
  const snapshot = await table.controlledSnapshot();
  expect(snapshot.view.openedRowId).toBeNull();
  expect(snapshot.lastViewAction).toMatchObject({
    type: "view.opened_row.change",
    payload: {
      previousRowId: "row-empty",
      nextRowId: null,
    },
  });
  await expect(page).toHaveURL(/\/table-view\/controlled$/);
});
