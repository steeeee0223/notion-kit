import { TableViewObject } from "../../../../apps/e2e/tests/component-objects/table-view.ts";
import { expect, test } from "./fixtures.mts";

test("editing-and-resources: cancel, commit, reopen, and edit a List title", async ({
  page,
}) => {
  const table = await TableViewObject.open(page, "controlled");
  const editor = await table.cellEditor("Alpha", "first note").open();
  await editor.textbox().fill("discard this draft");
  await editor.textbox().press("Escape");
  await expect(editor.textbox()).toHaveCount(0);
  await expect(table.row("Alpha")).toContainText("first note");
  expect((await table.controlledSnapshot()).dataCount).toBe(0);

  await table.cellEditor("Alpha", /first note$/).fill("source-derived note");
  await expect(table.row("Alpha")).toContainText("source-derived note");
  expect((await table.controlledSnapshot()).lastDataAction).toMatchObject({
    type: "data.cell.update",
    payload: {
      rowId: "row-alpha",
      propertyId: "notes",
      nextValue: "source-derived note",
    },
  });
  await table.openPrimaryRow("table", { id: "row-alpha", name: "Alpha" });
  const dialog = page.getByRole("dialog", { name: "Alpha", exact: true });
  await expect(table.rowViewPropertyValue(dialog, "Notes")).toContainText(
    "source-derived note",
  );
  await dialog.getByRole("button", { name: "Close row", exact: true }).click();

  await table.setLayout("list");
  const alpha = table.rowBlock("row-alpha");
  await alpha.hover();
  await alpha.getByRole("button", { name: "Edit", exact: true }).click();
  const titleInput = page.getByRole("textbox").filter({ visible: true });
  await expect(titleInput).toHaveValue("Alpha");
  await titleInput.fill("Alpha from List");
  await titleInput.press("Enter");
  await table.setLayout("table");
  await expect(table.row("Alpha from List")).toContainText(
    "source-derived note",
  );
  expect((await table.renderedResourceSnapshot()).data).toEqual(
    (await table.controlledSnapshot()).data,
  );
});

test("properties: configure Number through its menu and reopen from row detail", async ({
  page,
}) => {
  const table = await TableViewObject.open(page, "controlled");
  const header = await table.openHeader("Score");
  await header.item("Edit property").hover();
  await page.getByRole("menuitem", { name: /^Number format/ }).hover();
  await page
    .getByRole("menuitemradio", { name: "Currency", exact: true })
    .click();
  await page.keyboard.press("Escape");
  await page.keyboard.press("Escape");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("menu")).toHaveCount(0);
  await expect(table.propertyCell("Alpha", "score")).toContainText("$10");
  const formatted = await table.controlledSnapshot();
  expect(
    formatted.data.find(({ id }) => id === "row-alpha")?.properties.score
      ?.value,
  ).toBe("10");
  expect(
    formatted.properties.find(({ id }) => id === "score")?.config,
  ).toMatchObject({ format: "currency" });

  await (await table.openHeader("Score")).item("Edit property").hover();
  await page
    .getByRole("menu", { name: "Edit property", exact: true })
    .getByRole("button", { name: /Bar$/ })
    .click();
  await page.keyboard.press("Escape");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("menu")).toHaveCount(0);
  await expect(
    table.propertyCell("Alpha", "score").getByRole("meter"),
  ).toBeVisible();
  expect(
    (await table.controlledSnapshot()).properties.find(
      ({ id }) => id === "score",
    )?.config,
  ).toMatchObject({ showAs: "bar" });
  expect((await table.controlledSnapshot()).lastPropertiesAction).toMatchObject(
    {
      type: "properties.update",
      payload: { propertyId: "score" },
    },
  );

  await table.openPrimaryRow("table", { id: "row-alpha", name: "Alpha" });
  const dialog = page.getByRole("dialog", { name: "Alpha", exact: true });
  await table.rowViewPropertyLabel(dialog, "Score").click();
  await page
    .getByRole("menuitem", { name: "Edit property", exact: true })
    .hover();
  await expect(
    page
      .getByRole("menu", { name: "Edit property", exact: true })
      .getByRole("button", { name: /Bar$/ }),
  ).toHaveAttribute("aria-selected", "true");
});

test("finding-and-organizing: nested Or/And filters and the active badge", async ({
  page,
}) => {
  const table = await TableViewObject.open(page, "controlled");
  await (await table.openSettings()).item("Filter").click();
  const filters = page.getByRole("dialog", { name: "Filters", exact: true });
  await filters
    .getByRole("button", { name: "Add filter rule", exact: true })
    .click();
  await page
    .getByRole("menuitem", { name: "Add filter group", exact: true })
    .click();
  const group = filters.getByRole("group", {
    name: "Filter group",
    exact: true,
  });

  for (const [index, operator, value] of [
    [0, "Greater than", "50"],
    [1, "Less than", "20"],
  ] as const) {
    await group
      .getByRole("button", { name: "Add filter rule", exact: true })
      .click();
    await page
      .getByRole("menuitem", { name: "Add filter rule", exact: true })
      .click();
    const rules = group.getByRole("group", {
      name: "Filter rule",
      exact: true,
    });
    await expect(rules).toHaveCount(index + 1);
    // Rules are appended in creation order; scope every control to that new rule.
    const rule = rules.nth(index);
    await rule
      .getByRole("combobox", { name: "Property select", exact: true })
      .click();
    await page.getByRole("option", { name: "Score", exact: true }).click();
    await rule
      .getByRole("combobox", { name: "Operator select", exact: true })
      .click();
    await page.getByRole("option", { name: operator, exact: true }).click();
    await rule.getByRole("textbox", { name: "Value", exact: true }).fill(value);
    await rule
      .getByRole("textbox", { name: "Value", exact: true })
      .press("Tab");
  }
  await expect(table.rows()).toHaveCount(0);
  const logic = group.getByRole("combobox", {
    name: "Filter logic select",
    exact: true,
  });
  await logic.click();
  await page.getByRole("option", { name: "Or", exact: true }).click();
  await expect(table.rowTitles()).toHaveCount(2);
  await expect(table.row("Alpha")).toBeVisible();
  await expect(table.row("Omega")).toBeVisible();
  await expect(table.row("Empty")).toHaveCount(0);
  expect((await table.controlledSnapshot()).view.filters).toMatchObject({
    kind: "group",
    children: [
      {
        kind: "group",
        logic: "or",
        children: [
          { propertyId: "score", operator: "greater-than", value: 50 },
          { propertyId: "score", operator: "less-than", value: 20 },
        ],
      },
    ],
  });
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "2 rules", exact: true }).click();
  await expect(logic).toContainText("Or");
  await logic.click();
  await page.getByRole("option", { name: "And", exact: true }).click();
  await expect(table.rows()).toHaveCount(0);
  await filters
    .getByRole("menuitem", { name: "Delete filter", exact: true })
    .click();
  await expect(table.rowTitles()).toHaveCount(3);
  expect((await table.controlledSnapshot()).view.filters).toBeNull();
});

test("selection-and-row-actions: select-all state, bulk overwrite, and lock clears selection", async ({
  page,
}) => {
  const table = await TableViewObject.open(page, "controlled");
  await table.rowCheckbox("row-alpha").click();
  await table.rowCheckbox("row-empty").click();
  await expect(
    page.getByRole("checkbox", { name: "Select all rows", exact: true }),
  ).toBeChecked({ indeterminate: true });
  const bar = table.bulkEditBar();
  await expect(bar.getByText("2 rows selected", { exact: true })).toBeVisible();
  expect((await table.controlledSnapshot()).dataCount).toBe(0);
  await bar.getByRole("button", { name: "Tags", exact: true }).click();
  await page.getByRole("option", { name: /Backend$/ }).click();
  const snapshot = await table.controlledSnapshot();
  expect(snapshot.lastDataAction).toMatchObject({
    type: "data.cell.update",
    payload: { rowIds: ["row-alpha", "row-empty"], propertyId: "tags" },
  });
  for (const id of ["row-alpha", "row-empty"]) {
    expect(
      snapshot.data.find((row) => row.id === id)?.properties.tags?.value,
    ).toEqual(["Backend"]);
  }
  expect(
    snapshot.data.find((row) => row.id === "row-omega")?.properties.tags?.value,
  ).toEqual(["Frontend", "Backend"]);
  await page.keyboard.press("Escape");
  await (await table.openSettings()).toggleLock();
  await page.keyboard.press("Escape");
  await expect(bar).toHaveCount(0);
  await expect(table.rowCheckbox("row-alpha")).toHaveCount(0);
  await expect(table.controlledState()).toContainText('"locked":true');
});

test("layouts-and-row-views: implemented layouts and Timeline row entry points", async ({
  page,
}) => {
  await page.clock.setFixedTime(new Date("2025-01-01T12:00:00Z"));
  const table = await TableViewObject.open(page, "controlled");
  const layout = await (await table.openSettings()).openLayout();
  for (const name of ["Calendar", "Gallery", "Chart"]) {
    await expect(layout.button(name)).toBeDisabled();
  }
  for (const name of ["Table", "List", "Board", "Timeline"]) {
    await expect(layout.button(name)).toBeEnabled();
  }
  await layout.button("Timeline").click();
  await layout.close();
  await expect(table.timelineContent()).toBeVisible();
  await table.setTimelineRange("Day");
  expect((await table.controlledSnapshot()).view.timeline.range).toBe("daily");
  // The current sidebar title is a generic clickable element, not a button.
  const sidebarTitle = table
    .timelineSidebarRow("row-alpha")
    .getByLabel("Alpha", { exact: true });
  const titleBounds = await sidebarTitle.boundingBox();
  if (!titleBounds) throw new Error("Timeline sidebar title has no bounds");
  // Row-action controls overlap its leading area; use its unobscured trailing area.
  await sidebarTitle.click({
    position: { x: titleBounds.width - 12, y: titleBounds.height / 2 },
  });
  let dialog = page.getByRole("dialog", { name: "Alpha", exact: true });
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: "Close row", exact: true }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await table.timelineItemCard("row-alpha").click();
  dialog = page.getByRole("dialog", { name: "Alpha", exact: true });
  await expect(dialog).toBeVisible();
  expect((await table.controlledSnapshot()).view.openedRowId).toBe("row-alpha");
  await dialog.getByRole("button", { name: "Close row", exact: true }).click();
  await page.getByRole("button", { name: "Hide table", exact: true }).click();
  await expect(table.timelineSidebar()).toHaveCount(0);
  await page.getByRole("button", { name: "Show table", exact: true }).click();
  await expect(table.timelineSidebar()).toBeVisible();
});
