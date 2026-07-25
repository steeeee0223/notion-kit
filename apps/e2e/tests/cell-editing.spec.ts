import { TableViewObject } from "./component-objects/table-view";
import { expect, test } from "./fixtures";

test("CellEditors_ExistingValues_RoundTripEveryEditablePlugin", async ({
  page,
}) => {
  const table = await TableViewObject.open(page, "controlled");

  await table.editTextCell("Alpha", "Alpha", "Alpha renamed");
  await table.editTextCell("Alpha renamed", "first note", "browser note");
  await table.editTextCell("Alpha renamed", "10", "42");

  await table.cellEditor("Alpha renamed", "Active").choose("Backlog");
  await expect(table.row("Alpha renamed")).toContainText("Backlog");

  await table.cellEditor("Alpha renamed", "Frontend").choose("Backend");
  await expect(table.row("Alpha renamed")).toContainText("Frontend");
  await expect(table.row("Alpha renamed")).toContainText("Backend");

  const complete = table.checkboxCell("Alpha renamed");
  await complete.click();
  await expect(complete.getByRole("checkbox").first()).not.toBeChecked();

  await table
    .cellEditor("Alpha renamed", "January 1, 2025")
    .chooseDate(/January 15th, 2025/i);
  await expect(table.row("Alpha renamed")).toContainText("January 15, 2025");

  await table.editTextCell(
    "Alpha renamed",
    "alpha@example.com",
    "renamed@example.com",
  );
  await expect(
    table.row("Alpha renamed").getByRole("link", {
      name: "renamed@example.com",
    }),
  ).toHaveAttribute("href", "mailto:renamed@example.com");

  await table.editTextCell(
    "Alpha renamed",
    "+886900000001",
    "+886900000099",
  );
  await expect(
    table.row("Alpha renamed").getByRole("link", {
      name: "+886900000099",
    }),
  ).toHaveAttribute("href", "tel:+886900000099");

  await table.editTextCell(
    "Alpha renamed",
    "https://example.com/alpha",
    "https://example.com/renamed",
  );
  await expect(
    table.row("Alpha renamed").getByRole("link", {
      name: "https://example.com/renamed",
    }),
  ).toHaveAttribute("href", "https://example.com/renamed");

  await expect(table.row("Alpha renamed")).toContainText("browser note");
  await expect(table.row("Alpha renamed")).toContainText("42");
  await expect(table.controlledState()).toContainText(
    '"type":"data.cell.update"',
  );
});

test("GeneratedTimeCells_FixedTimestamps_RenderReadOnlyValues", async ({
  page,
}) => {
  const table = await TableViewObject.open(page, "controlled");
  const generatedTimes = table
    .row("Alpha")
    .getByText("January 1, 2025 00:00", { exact: true });

  await expect(generatedTimes).toHaveCount(2);
  await generatedTimes.first().click();
  await expect(page.getByRole("textbox")).toHaveCount(0);
  await expect(table.controlledState()).toContainText('"dataCount":0');
});

test("CellEditors_EmptyValues_RoundTripThroughNamedRowViewProperties", async ({
  page,
}) => {
  const table = await TableViewObject.open(page, "controlled");
  const emptyRow = table.row("Empty");
  await emptyRow.hover();
  await emptyRow
    .getByRole("button", { name: "Open in side peek", exact: true })
    .click();
  const rowView = page.getByRole("dialog", { name: "Empty" });

  const valueButton = (property: string) =>
    rowView
      .getByRole("row", { name: new RegExp(`^${property}`) })
      .getByRole("cell")
      .last()
      .getByRole("button")
      .first();

  const fill = async (property: string, value: string) => {
    const trigger = valueButton(property);
    await trigger.press("Enter");
    const textbox = page.getByRole("textbox").last();
    await textbox.fill(value);
    await textbox.press("Enter");
    await expect(valueButton(property)).toContainText(value);
  };

  await fill("Notes", "filled note");
  await fill("Score", "7");
  await fill("Email", "empty@example.com");
  await fill("Phone", "+886900000007");
  await fill("Website", "https://example.com/empty");

  await valueButton("Status").press("Enter");
  await page.getByRole("option", { name: "Backlog" }).click();
  await expect(valueButton("Status")).toContainText("Backlog");

  await valueButton("Tags").press("Enter");
  await page.getByRole("option", { name: "Backend" }).click();
  await page.keyboard.press("Escape");
  await expect(valueButton("Tags")).toContainText("Backend");

  const complete = valueButton("Complete");
  await complete.click();
  await expect(complete.getByRole("checkbox").first()).toBeChecked();

  await valueButton("Due").press("Enter");
  const dateInput = page.getByRole("textbox").last();
  await dateInput.fill("2025-01-20");
  await dateInput.press("Tab");
  await expect(valueButton("Due")).toContainText("January 20, 2025");
});

test("SelectEditor_DuplicateOption_ShowsValidationWithoutMutation", async ({
  page,
}) => {
  const table = await TableViewObject.open(page, "controlled");
  await table.cell("Alpha", "Active").press("Enter");
  const active = page.getByRole("option", { name: "Active" });
  await active.hover();
  await active
    .locator('xpath=ancestor::*[@data-slot="sortable-item"]')
    .getByRole("button", { name: "More" })
    .click();
  const optionEditor = page
    .getByRole("menu")
    .filter({ has: page.getByText("Colors", { exact: true }) })
    .last();
  const input = optionEditor.getByRole("textbox").first();
  await expect(input).toHaveValue("Active");
  await input.fill("Done");

  await expect(optionEditor.getByText("Option already exists.")).toBeVisible();
  await expect(table.controlledState()).toContainText('"propertiesCount":0');
  await expect(table.controlledState()).toContainText('"dataCount":0');
});
