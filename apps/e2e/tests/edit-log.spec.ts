import { EditLogDialogObject } from "./component-objects/edit-log-dialog";
import { RowActionsObject } from "./component-objects/row-actions";
import { TableViewObject } from "./component-objects/table-view";
import { expect, test } from "./fixtures";

for (const mode of ["controlled", "uncontrolled"] as const) {
  test(`EditLog_${mode}_ManualPaginationRetainsScrollAndReturnsSettingsFocus`, async ({
    page,
  }, testInfo) => {
    const table = await TableViewObject.open(page, mode);
    const menu = await table.openSettings();
    await menu.item("Edit log").click();
    const log = new EditLogDialogObject(page);
    await log.waitForEntries(10);
    await expect(menu.root).toBeHidden();
    await log.scrollToEnd();
    const scrollTop = await log.scrollPosition();
    expect(scrollTop).toBeGreaterThan(0);
    await expect(log.entries()).toHaveCount(10);
    const firstEntry = await log.entries().first().textContent();

    await log.loadMore();
    await expect.poll(() => log.entries().count()).toBeGreaterThan(10);
    expect(await log.scrollPosition()).toBeCloseTo(scrollTop, 0);
    await expect(log.entries().first()).toHaveText(firstEntry!);
    await log.root.screenshot({
      path: testInfo.outputPath(`${mode}-edit-log.png`),
    });
    await log.closeWithEscape();
    await expect(table.settingsButton()).toBeFocused();

    await (await table.openSettings()).item("Edit log").click();
    await log.waitForEntries(10);
    await log.close();
    await expect(table.settingsButton()).toBeFocused();
  });
}

test("EditLog_RowPopover_DisablesRowShortcutsAndKeepsHistoricalValues", async ({
  page,
}, testInfo) => {
  const table = await TableViewObject.open(page, "controlled");
  await table.editTextCell("Alpha", "first note", "live replacement");
  const before = await table.controlledSnapshot();
  const trigger = table
    .row("Alpha")
    .getByRole("button", { name: "Row actions", exact: true });
  const menu = await table.openRowActions("Alpha");
  await menu.choose("Edit log");
  const log = new EditLogDialogObject(page);
  await log.waitForEntries(10);
  await expect(menu.root).toBeHidden();
  await expect(log.root).toContainText("Alpha");
  await expect(log.root).toContainText("first note");
  await expect(log.root).not.toContainText("live replacement");
  await page.keyboard.press("Meta+d");
  await page.keyboard.press("Backspace");
  const after = await table.controlledSnapshot();
  expect(after.data).toEqual(before.data);
  expect(after.dataCount).toBe(before.dataCount);
  expect(after.propertiesCount).toBe(before.propertiesCount);
  expect(after.viewCount).toBe(before.viewCount);

  await log.scrollToEnd();
  await log.loadMore();
  await expect.poll(() => log.entries().count()).toBeGreaterThan(10);
  await log.root.screenshot({ path: testInfo.outputPath("row-edit-log.png") });
  await log.closeWithEscape();
  await expect(trigger).toBeFocused();

  await table.button("Dark mode").click();
  await page.setViewportSize({ width: 390, height: 844 });
  await (await table.openRowActions("Omega")).choose("Edit log");
  await log.waitForEntries(10);
  await expect(log.root).toContainText("Frontend");
  await expect(log.root).toContainText("Backend");
  const width = await log.root.evaluate((element) => ({
    content: element.scrollWidth,
    visible: element.clientWidth,
  }));
  expect(width.content).toBeLessThanOrEqual(width.visible);
  await log.root.screenshot({
    path: testInfo.outputPath("row-edit-log-dark-mobile.png"),
  });
  await log.closeWithEscape();
});

test("EditLog_CalendarContextMenu_ReturnsFocusToItsEvent", async ({ page }) => {
  await page.addInitScript(
    (now) => {
      const original = Date.now;
      const offset = now - original();
      Date.now = () => original() + offset;
    },
    Date.UTC(2025, 0, 1, 12),
  );
  const table = await TableViewObject.open(page, "controlled");
  await table.setLayout("calendar");
  const card = table.calendar().card({ id: "row-alpha", name: "Alpha" });
  await card.click({ button: "right" });
  const menu = new RowActionsObject(page, page.getByRole("menu"));
  await menu.choose("Edit log");
  const log = new EditLogDialogObject(page);
  await log.waitForEntries(10);
  await expect(menu.root).toBeHidden();
  await log.closeWithEscape();
  await expect(card).toBeFocused();
});
