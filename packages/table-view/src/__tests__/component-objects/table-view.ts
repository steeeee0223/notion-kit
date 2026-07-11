import { screen, within } from "@testing-library/react";
import type { UserEvent } from "@testing-library/user-event";

import { RowActionsObject } from "./row-actions";
import { SortMenuObject } from "./sort-menu";
import { ViewSettingsMenuObject } from "./view-settings-menu";

export class TableViewObject {
  constructor(readonly user: UserEvent) {}

  private nameMatcher(name: string | RegExp) {
    return typeof name === "string"
      ? new RegExp(name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
      : name;
  }

  button(name: string | RegExp) {
    return screen.getByRole("button", { name });
  }

  row(name: string | RegExp) {
    const matcher = this.nameMatcher(name);
    const row = screen
      .getAllByRole("row")
      .find((row) => matcher.test(row.textContent ?? ""));
    if (!row) throw new Error(`Unable to find row matching ${matcher}`);
    return row;
  }

  rows(name?: string | RegExp) {
    const rows = screen.getAllByRole("row");
    if (!name) return rows;
    const matcher = this.nameMatcher(name);
    return rows.filter((row) => matcher.test(row.textContent ?? ""));
  }

  cellButton(rowName: string | RegExp, cellName: string | RegExp) {
    return within(this.row(rowName)).getByRole("button", { name: cellName });
  }

  async openViewSettings() {
    await this.user.click(this.button("Settings"));
    return ViewSettingsMenuObject.find(this.user);
  }

  async openSortMenu() {
    await this.user.click(this.button("Sort"));
    return SortMenuObject.find(this.user);
  }

  async openRowActions(rowName: string) {
    return RowActionsObject.open(this, rowName);
  }

  async clickButton(name: string | RegExp) {
    await this.user.click(this.button(name));
  }

  async clickOutside() {
    await this.user.click(document.body);
  }
}
