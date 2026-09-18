import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import { expect } from "vitest";

import { TableViewObject } from "./table-view";

export class RowActionsObject {
  constructor(
    private readonly tableView: TableViewObject,
    readonly root: HTMLElement,
  ) {}

  static async open(tableView: TableViewObject, rowName: string) {
    return RowActionsObject.openFromTrigger(
      tableView,
      RowActionsObject.trigger(tableView.row(rowName)),
    );
  }

  static trigger(row: HTMLElement) {
    return within(row).getByRole("button", { name: "Row actions" });
  }

  static boardTrigger(card: HTMLElement) {
    return within(card).getByRole("button", { name: "Actions" });
  }

  static async openFromTrigger(
    tableView: TableViewObject,
    trigger: HTMLElement,
    contextMenu = false,
  ) {
    if (contextMenu) {
      fireEvent.contextMenu(trigger, { clientX: 40, clientY: 20 });
    } else {
      await tableView.user.click(trigger);
    }

    return new RowActionsObject(
      tableView,
      await screen.findByRole(contextMenu ? "menu" : "dialog"),
    );
  }

  searchInput() {
    return within(this.root).getByRole<HTMLInputElement>("combobox", {
      name: "Search actions",
    });
  }

  option(name: string | RegExp) {
    return within(this.root).getByRole("option", { name });
  }

  text(name: string | RegExp) {
    return within(this.root).getByText(name);
  }

  queryOption(name: string | RegExp) {
    return within(this.root).queryByRole("option", { name });
  }

  shortcutFor(name: string | RegExp, shortcut: string | RegExp) {
    return within(this.option(name)).getByText(shortcut);
  }

  async search(value: string) {
    await this.tableView.user.type(this.searchInput(), value);
  }

  async press(keys: string) {
    await this.tableView.user.keyboard(keys);
  }

  choose(name: string | RegExp) {
    fireEvent.click(this.option(name));
  }

  async openEditLog() {
    await this.tableView.user.click(this.option("Edit log"));
  }

  async waitUntilClosed() {
    await waitFor(() => expect(this.root).not.toBeInTheDocument());
  }

  async waitForRowCount(rowName: string | RegExp, count: number) {
    await waitFor(() => {
      expect(this.tableView.rows(rowName)).toHaveLength(count);
    });
  }

  async waitForRowRemoved(rowName: string | RegExp) {
    await waitFor(() => {
      expect(this.tableView.rows(rowName)).toHaveLength(0);
    });
  }
}
