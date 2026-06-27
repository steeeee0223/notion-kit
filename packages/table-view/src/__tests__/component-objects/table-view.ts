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
    return screen.getByRole("row", { name: this.nameMatcher(name) });
  }

  rows(name?: string | RegExp) {
    return name
      ? screen.getAllByRole("row", { name: this.nameMatcher(name) })
      : screen.getAllByRole("row");
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
