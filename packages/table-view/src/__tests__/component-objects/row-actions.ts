import { screen, waitFor, within } from "@testing-library/react";
import { expect } from "vitest";

import { TableViewObject } from "./table-view";

export class RowActionsObject {
  constructor(
    private readonly tableView: TableViewObject,
    readonly root: HTMLElement,
  ) {}

  static async open(tableView: TableViewObject, rowName: string) {
    const row = tableView.row(rowName);
    await tableView.user.click(
      within(row).getByRole("button", { name: "Row actions" }),
    );

    return new RowActionsObject(tableView, await screen.findByRole("dialog"));
  }

  searchInput() {
    return within(this.root).getByPlaceholderText<HTMLInputElement>(
      "Search actions...",
    );
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

  async choose(name: string | RegExp) {
    await this.tableView.user.click(this.option(name));
  }

  async waitForRowCount(rowName: string | RegExp, count: number) {
    await waitFor(() => {
      expect(this.tableView.rows(rowName)).toHaveLength(count);
    });
  }

  async waitForRowRemoved(rowName: string | RegExp) {
    await waitFor(() => {
      expect(
        screen.queryByRole("row", { name: rowName }),
      ).not.toBeInTheDocument();
    });
  }
}
