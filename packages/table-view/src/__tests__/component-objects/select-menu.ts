import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import { expect } from "vitest";

import { TableViewObject } from "./table-view";

export class SelectMenuObject {
  constructor(
    private readonly tableView: TableViewObject,
    readonly cell: HTMLElement,
  ) {}

  static async open(
    tableView: TableViewObject,
    rowName: string,
    propertyName: string,
  ) {
    const rowButtons = within(tableView.row(rowName)).getAllByRole("button");
    const cell =
      propertyName === "Tags" ? rowButtons.at(-1) : rowButtons.at(-2);
    if (!cell) throw new Error(`Expected ${propertyName} cell button`);
    await tableView.user.click(cell);
    await screen.findByRole("combobox");
    return new SelectMenuObject(tableView, cell);
  }

  combobox() {
    return screen.getByRole("combobox");
  }

  option(name: string) {
    return screen.getByRole("option", { name });
  }

  queryOption(name: string) {
    return screen.queryByRole("option", { name });
  }

  optionActionsItem(name: string | RegExp) {
    return screen.getByRole("menuitem", { name });
  }

  createOption(name: string) {
    return screen.getByRole("option", { name: `Create ${name}` });
  }

  selectedCell() {
    return this.cell;
  }

  optionGroup() {
    const comboboxParent = this.combobox().parentElement;
    if (!comboboxParent) throw new Error("Expected combobox parent");
    return comboboxParent;
  }

  async search(value: string) {
    await this.tableView.user.type(this.combobox(), value);
  }

  choose(name: string) {
    fireEvent.click(this.option(name));
  }

  async create(name: string) {
    await this.search(name);
    fireEvent.click(this.createOption(name));
  }

  async close() {
    await this.tableView.user.keyboard("{Escape}");
  }

  async clearSelectionWithBackspace() {
    await this.tableView.user.click(this.combobox());
    await this.tableView.user.keyboard("{Backspace}");
  }

  async waitForCellText(text: string | RegExp) {
    await waitFor(() => {
      expect(this.selectedCell()).toHaveTextContent(text);
    });
  }

  async waitForCellNotText(text: string | RegExp) {
    await waitFor(() => {
      expect(this.selectedCell()).not.toHaveTextContent(text);
    });
  }

  async openOptionActions(name: string) {
    const option = this.option(name);
    await this.tableView.user.hover(option);
    fireEvent.click(within(option).getByRole("button", { name: /more/i }));
    await screen.findByRole("menuitem", { name: /delete/i });
  }

  async deleteOption(name: string) {
    await this.openOptionActions(name);
    await this.tableView.user.click(this.optionActionsItem(/delete/i));
  }
}
