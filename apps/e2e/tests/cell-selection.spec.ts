import { expect, test, type Locator, type Page } from "@playwright/test";

import { TableViewObject } from "./component-objects/table-view";

async function point(cell: Locator) {
  await cell.scrollIntoViewIfNeeded();
  const box = await cell.boundingBox();
  if (!box) throw new Error("Cell has no layout box");
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
}

async function drag(page: Page, start: Locator, end: Locator) {
  const from = await point(start);
  const to = await point(end);
  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  await page.mouse.move(to.x, to.y, { steps: 8 });
  await page.mouse.up();
}

for (const mode of ["controlled", "uncontrolled"] as const) {
  test(`CellSelection_${mode}_EditorCloseAndKeyboard`, async ({ page }) => {
    const table = await TableViewObject.open(page, mode);
    const title = table.propertyCell("Alpha", "title");
    await title.getByRole("button", { name: "Alpha", exact: true }).click();
    await expect(page.locator("[data-cell-selection-overlay]")).toHaveCount(0);
    await page.keyboard.press("Escape");
    await expect(title).toBeFocused();
    await expect(title).toHaveAttribute("data-cell-selected", "true");
    await page.keyboard.press("ArrowRight");
    const notes = table.propertyCell("Alpha", "notes");
    await expect(notes).toBeFocused();
    await page.keyboard.press("Shift+ArrowDown");
    await expect(notes).toHaveAttribute("data-cell-selected", "true");
    await expect(table.propertyCell("Empty", "notes")).toHaveAttribute(
      "data-cell-selected",
      "true",
    );
    await page.keyboard.press("Control+a");
    const dataCells = page.locator("[data-property-id][data-cell-selected]");
    await expect(page.locator('[data-cell-selected="true"]')).toHaveCount(
      await dataCells.count(),
    );
    await page.keyboard.press("Escape");
    await expect(page.locator('[data-cell-selected="true"]')).toHaveCount(0);
  });
}

test("CellSelection_DragAndContinuousPerimeter", async ({ page }, testInfo) => {
  const table = await TableViewObject.open(page, "controlled");
  const start = table.propertyCell("Alpha", "title");
  const end = table.propertyCell("Omega", "notes");
  const before = await start.boundingBox();
  await drag(page, start, end);
  await expect(page.locator('[data-cell-selected="true"]')).toHaveCount(6);
  await expect(page.getByRole("textbox")).toHaveCount(0);
  await expect(table.controlledState()).toContainText('"dataCount":0');
  expect(await start.boundingBox()).toEqual(before);
  const firstBorder = start.locator("[data-cell-selection-overlay]");
  await expect(firstBorder).toHaveAttribute("data-selection-edges", "top left");
  await expect(firstBorder.locator("[data-cell-selection-outline]")).toHaveCSS(
    "box-shadow",
    /2px/,
  );
  await expect(firstBorder).toHaveCSS("pointer-events", "none");
  await expect(end.locator("[data-cell-selection-overlay]")).toHaveAttribute(
    "data-selection-edges",
    "right bottom",
  );
  await page.screenshot({
    path: testInfo.outputPath("selection-perimeter.png"),
    fullPage: true,
  });
  await drag(page, end, start);
  await expect(page.locator('[data-cell-selected="true"]')).toHaveCount(6);
});

for (const modifier of ["Control", "Meta"] as const) {
  test(`CellSelection_${modifier}_SubtractAndShiftExtend`, async ({ page }) => {
    const table = await TableViewObject.open(page, "controlled");
    const first = table.propertyCell("Alpha", "title");
    const last = table.propertyCell("Omega", "notes");
    await drag(page, first, last);
    await first.click({ modifiers: [modifier], position: { x: 30, y: 18 } });
    await expect(first).toHaveAttribute("data-cell-selected", "false");
    await expect(last).toHaveAttribute("data-cell-selected", "true");
    await expect(page.getByRole("textbox")).toHaveCount(0);
    await first.click({ modifiers: [modifier], position: { x: 30, y: 18 } });
    await expect(first).toHaveAttribute("data-cell-selected", "true");
    await last.click({ modifiers: ["Shift"], position: { x: 30, y: 18 } });
    await expect(page.getByRole("textbox")).toHaveCount(0);
  });
}

test("CellSelection_OutsideReleaseAndNewEditorOwnership", async ({ page }) => {
  const table = await TableViewObject.open(page, "controlled");
  const first = table.propertyCell("Alpha", "title");
  const end = table.propertyCell("Omega", "notes");
  const from = await point(first);
  const to = await point(end);
  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  await page.mouse.move(to.x, to.y, { steps: 8 });
  await page.mouse.move(5, 5);
  await page.mouse.up();
  await table.propertyCell("Omega", "score").hover();
  await expect(page.locator('[data-cell-selected="true"]')).toHaveCount(6);
  await first.getByRole("button", { name: "Alpha", exact: true }).click();
  await expect(page.getByRole("textbox")).toBeVisible();
  await end.getByRole("button", { name: "last note", exact: true }).click();
  // Base UI retains the closing editor briefly for its exit transition.
  await expect(page.getByRole("textbox")).toHaveCount(1);
  await expect(page.getByRole("textbox")).toHaveValue("last note");
  await page.keyboard.press("Escape");
  await expect(end).toBeFocused();
});

test("CellSelection_PinnedAndHiddenColumns", async ({ page }, testInfo) => {
  const table = await TableViewObject.open(page, "controlled");
  await (await table.openHeader("Name")).toggleFreeze();
  const first = table.propertyCell("Alpha", "title");
  const notes = table.propertyCell("Omega", "notes");
  await drag(page, first, notes);
  await expect(page.locator('[data-cell-selected="true"]')).toHaveCount(6);
  await expect(first.locator("[data-cell-selection-overlay]")).toHaveAttribute(
    "data-selection-edges",
    "top left",
  );
  await expect(notes.locator("[data-cell-selection-overlay]")).toHaveAttribute(
    "data-selection-edges",
    "right bottom",
  );
  await page.screenshot({
    path: testInfo.outputPath("pinned-perimeter.png"),
    fullPage: true,
  });
  await (await table.openHeader("Notes")).hide();
  await expect(page.locator('[data-cell-selected="true"]')).toHaveCount(0);
  await first.getByRole("button", { name: "Alpha", exact: true }).click();
  await page.keyboard.press("Escape");
  await expect(first).toBeFocused();
  await page.keyboard.press("ArrowRight");
  await expect(table.propertyCell("Alpha", "score")).toBeFocused();
});

test("CellSelection_GroupingAndLayouts", async ({ page }) => {
  const table = await TableViewObject.open(page, "controlled");
  await table.groupBy("Complete");
  const groups = page
    .getByRole("group")
    .filter({ has: page.getByRole("button", { name: "Open", exact: true }) });
  while (await groups.count())
    await groups
      .first()
      .getByRole("button", { name: "Open", exact: true })
      .click();
  const titles = page.locator('[data-property-id="title"][data-cell-selected]');
  const first = titles.first();
  await first.getByRole("button").first().click();
  await page.keyboard.press("Escape");
  await expect(first).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await expect(titles.nth(1)).toBeFocused();
  await page.keyboard.press("Control+a");
  await expect(page.locator('[data-cell-selected="true"]')).toHaveCount(
    await page.locator("[data-cell-selected]").count(),
  );
  for (const layout of ["list", "board", "timeline"] as const) {
    await table.setLayout(layout);
    await expect(page.locator("[data-cell-selection-overlay]")).toHaveCount(0);
    await expect(page.locator('[data-cell-selected="true"]')).toHaveCount(0);
  }
});

test("CellSelection_CheckboxDragAndLockedTable", async ({ page }) => {
  const table = await TableViewObject.open(page, "controlled");
  const first = table.propertyCell("Alpha", "complete");
  const last = table.propertyCell("Omega", "complete");
  await first.locator("[data-cell-trigger]").click();
  await expect(first).toBeFocused();
  await expect(table.checkboxCellDisplay("Alpha")).toHaveAttribute(
    "aria-checked",
    "false",
  );
  await drag(page, first, last);
  await expect(table.controlledState()).toContainText('"dataCount":1');
  await (await table.openSettings()).toggleLock();
  await page.keyboard.press("Escape");
  await drag(page, first, last);
  await expect(page.locator('[data-cell-selected="true"]')).toHaveCount(3);
  await expect(table.controlledState()).toContainText('"dataCount":1');
  await expect(page.getByRole("textbox")).toHaveCount(0);
});

test("CellSelection_EditorCommitAndSelectEscape", async ({ page }) => {
  const table = await TableViewObject.open(page, "controlled");
  const notes = table.propertyCell("Alpha", "notes");
  await notes.locator("[data-cell-trigger]").click();
  await page.getByRole("textbox").fill("updated note");
  await page.keyboard.press("Enter");
  await expect(notes).toBeFocused();
  await expect(notes).toContainText("updated note");
  await expect(notes).toHaveAttribute("data-cell-selected", "true");
  const status = table.propertyCell("Alpha", "status");
  await status.locator("[data-cell-trigger]").click();
  await expect(page.getByRole("combobox")).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(status).toBeFocused();
  await expect(page.getByRole("combobox")).toHaveCount(0);
});

test("CellSelection_DateEscapeCancelsDraftBeforeRestoringFocus", async ({
  page,
}) => {
  const table = await TableViewObject.open(page, "controlled");
  const date = table.propertyCell("Alpha", "due");
  await date.locator("[data-cell-trigger]").click();
  await page.getByRole("textbox").fill("2025-02-14");
  await page.keyboard.press("Escape");
  await expect(date).toBeFocused();
  await expect(date).toHaveAttribute("data-cell-selected", "true");
  await expect(date).toContainText("January 1, 2025");
  await expect(table.controlledState()).toContainText('"dataCount":0');
});
