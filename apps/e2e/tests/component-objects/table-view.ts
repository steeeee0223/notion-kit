import { expect, type Locator, type Page } from "@playwright/test";

import { CellEditorsObject } from "./cell-editors";
import { GroupActionsObject } from "./group-actions";
import { HeaderMenuObject } from "./header-menu";
import type { AccessibleName } from "./menu-surface";
import { RowActionsObject } from "./row-actions";
import { SortMenuObject } from "./sort-menu";
import { ViewSettingsMenuObject } from "./view-settings-menu";

type TableMode = "controlled" | "uncontrolled";

export class TableViewObject {
  constructor(readonly page: Page) {}

  static async open(page: Page, mode: TableMode) {
    const table = new TableViewObject(page);
    await page.goto(`/table-view/${mode}`);
    await table.table().waitFor({ state: "visible" });
    return table;
  }

  table() {
    return this.page.getByRole("table");
  }

  rows() {
    return this.table().getByRole("row");
  }

  rowTitles() {
    return this.rows().getByRole("button", {
      name: /^(Alpha|Empty|Omega)$/,
      exact: true,
    });
  }

  row(name: AccessibleName) {
    return this.rows().filter({ hasText: name });
  }

  group(id: string) {
    return this.page.getByRole("group", { name: `Group ${id}`, exact: true });
  }

  groupActions(id: string) {
    return new GroupActionsObject(this.page, this.group(id));
  }

  async expandGroup(id: string) {
    await this.group(id).getByRole("button", { name: "Open" }).click();
  }

  button(name: AccessibleName) {
    return this.page.getByRole("button", { name });
  }

  settingsButton() {
    return this.button("Settings");
  }

  sortButton() {
    return this.button("Sort");
  }

  header(name: string) {
    return this.table().getByRole("button", { name, exact: true });
  }

  cell(rowName: AccessibleName, accessibleName: AccessibleName) {
    return this.row(rowName).getByRole("button", {
      name: accessibleName,
      exact: typeof accessibleName === "string",
    });
  }

  cellEditor(rowName: AccessibleName, accessibleName: AccessibleName) {
    return new CellEditorsObject(this.page, this.cell(rowName, accessibleName));
  }

  checkboxCell(rowName: AccessibleName) {
    const row = this.row(rowName);
    return row
      .getByRole("button")
      .filter({ has: this.page.getByRole("checkbox") });
  }

  async editTextCell(
    rowName: AccessibleName,
    currentValue: AccessibleName,
    nextValue: string,
  ) {
    await this.cellEditor(rowName, currentValue).fill(nextValue);
  }

  internalState() {
    return this.page.getByTestId("internal-state");
  }

  controlledState() {
    return this.page.getByTestId("controlled-state");
  }

  async controlledSnapshot() {
    return JSON.parse((await this.controlledState().textContent()) ?? "{}");
  }

  calculation(propertyName: string) {
    return this.table().getByRole("button", {
      name: `${propertyName} calculation`,
      exact: true,
    });
  }

  async setCalculation(propertyName: string, method: string) {
    const category = method.startsWith("Percent") ? "Percent" : "Count";
    const trigger = this.calculation(propertyName);

    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        await trigger.click();
        await expect(trigger).toHaveAttribute("aria-expanded", "true");
        const categoryItem = this.page
          .getByRole("menuitem", { name: category, exact: true })
          .last();
        await categoryItem.waitFor({ state: "visible", timeout: 2_000 });
        await categoryItem.dispatchEvent("click");
        const option = this.page
          .getByRole("menuitemcheckbox", { name: method, exact: true })
          .last();
        await option.waitFor({ state: "visible", timeout: 2_000 });
        // Base UI nested submenus currently close during Playwright
        // pointer/focus movement. Dispatch the same DOM activation while that
        // upstream issue is tracked separately; assertions still verify the
        // real menu handler and UI.
        await option.dispatchEvent("click");
        await trigger.dispatchEvent("click");
        await expect(trigger).toHaveAttribute("aria-expanded", "false");
        await option.waitFor({ state: "hidden", timeout: 2_000 });
        return;
      } catch (error) {
        if ((await trigger.getAttribute("aria-expanded")) === "true") {
          await trigger.dispatchEvent("click");
        }
        await expect(trigger).toHaveAttribute("aria-expanded", "false");
        if (attempt === 2) throw error;
      }
    }
  }

  async openSettings() {
    await this.settingsButton().click();
    return ViewSettingsMenuObject.open(this.page);
  }

  async openSort() {
    await this.sortButton().click();
    return SortMenuObject.open(this.page);
  }

  async openHeader(name: string) {
    await this.header(name).click();
    return HeaderMenuObject.open(this.page);
  }

  async openRowActions(rowName: AccessibleName) {
    const row = this.row(rowName);
    return this.openRowActionsFor(row);
  }

  async openRowActionsFor(row: Locator) {
    await row.hover();
    await row
      .getByRole("button", { name: "Row actions", exact: true })
      .click();
    return RowActionsObject.open(this.page);
  }

  async drag(source: Locator, target: Locator) {
    await source.dragTo(target);
  }
}
