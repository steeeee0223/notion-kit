import type { Locator, Page } from "@playwright/test";

import { CellEditorsObject } from "./cell-editors";
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

  row(name: AccessibleName) {
    return this.rows().filter({ hasText: name });
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
    return this.button(name);
  }

  cell(rowName: AccessibleName, accessibleName: AccessibleName) {
    return this.row(rowName).getByRole("button", { name: accessibleName });
  }

  cellEditor(rowName: AccessibleName, accessibleName: AccessibleName) {
    return new CellEditorsObject(this.page, this.cell(rowName, accessibleName));
  }

  internalState() {
    return this.page.getByTestId("internal-state");
  }

  controlledState() {
    return this.page.getByTestId("controlled-state");
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
    await row.hover();
    await row.getByRole("button", { name: "Row actions" }).click();
    return RowActionsObject.open(this.page);
  }

  async drag(source: Locator, target: Locator) {
    await source.dragTo(target);
  }
}
