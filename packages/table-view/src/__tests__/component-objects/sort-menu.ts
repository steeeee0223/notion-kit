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

  rule(id: string) {
    return within(this.root).getByTestId(`sort-rule-${id}`);
  }

  propertyTrigger(id: string) {
    return within(this.rule(id)).getByRole("combobox", {
      name: "Property select",
    });
  }

  moveHandle(id: string) {
    return within(this.rule(id)).getByRole("button", { name: "Move sort" });
  }

  removeButton(id: string) {
    return within(this.rule(id)).getByRole("button", { name: "Remove sort" });
  }

  directionTrigger(id: string) {
    return within(this.rule(id)).getByRole("combobox", {
      name: "Sort direction select",
    });
  }

  directionOption(name: string) {
    return screen.getByRole("option", { name });
  }

  queryDirection(name: string) {
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

  async remove(id: string) {
    await this.user.click(this.removeButton(id));
  }

  async openDirection(id: string, option = "Z → A") {
    await this.user.click(this.directionTrigger(id));
    await screen.findByRole("option", { name: option });
  }
}
