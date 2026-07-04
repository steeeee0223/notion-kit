import { screen, waitFor, within } from "@testing-library/react";
import type { UserEvent } from "@testing-library/user-event";

import { findMenuByItem, MenuSurfaceObject } from "./menu-surface";

export class SortMenuObject extends MenuSurfaceObject {
  static async find(user: UserEvent) {
    return new SortMenuObject(user, await findMenuByItem("Add sort"));
  }

  addSortItem() {
    return this.item("Add sort");
  }

  deleteSortItem() {
    return this.item("Delete sort");
  }

  searchInput() {
    return screen.getByPlaceholderText<HTMLInputElement>(
      "Search for a property...",
    );
  }

  querySearchInput() {
    return screen.queryByPlaceholderText("Search for a property...");
  }

  propertyOption(name: string) {
    return screen.getByRole("option", { name });
  }

  moveHandle(name: string) {
    return within(this.root).getByRole("button", { name: `Move ${name}` });
  }

  removeButton(name: string) {
    return within(this.root).getByRole("button", {
      name: `Remove ${name} sort`,
    });
  }

  directionTrigger(name: "Ascending" | "Descending") {
    return within(this.root).getByRole("combobox", { name });
  }

  directionOption(name: "Ascending" | "Descending") {
    return screen.getByRole("option", { name });
  }

  queryDirection(name: "Ascending" | "Descending") {
    return within(this.root).queryByText(name);
  }

  async startAdding() {
    await this.user.click(this.addSortItem());
    await waitFor(() => this.searchInput());
  }

  async search(value: string) {
    await this.user.type(this.searchInput(), value);
  }

  async addRule(propertyName: string) {
    await this.startAdding();
    await this.user.click(this.propertyOption(propertyName));
    await waitFor(() => {
      if (this.querySearchInput()) {
        throw new Error("Expected the add-sort panel to close");
      }
    });
  }

  async deleteAll() {
    await this.user.click(this.deleteSortItem());
  }

  async remove(name: string) {
    await this.user.click(this.removeButton(name));
  }

  async openDirection(name: "Ascending" | "Descending") {
    await this.user.click(this.directionTrigger(name));
    await screen.findByRole("option", { name: "Descending" });
  }
}
