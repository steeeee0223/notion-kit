import { waitFor, within } from "@testing-library/react";
import type { UserEvent } from "@testing-library/user-event";

import { findMenuByHeading, MenuSurfaceObject } from "./menu-surface";

export class PropertiesMenuObject extends MenuSurfaceObject {
  static async find(user: UserEvent) {
    return new PropertiesMenuObject(
      user,
      await findMenuByHeading("Properties"),
    );
  }

  heading() {
    return super.heading("Properties");
  }

  searchInput() {
    return within(this.root).getByPlaceholderText<HTMLInputElement>(
      "Search for a property...",
    );
  }

  property(name: string) {
    return within(this.root).getByRole("option", { name });
  }

  queryProperty(name: string) {
    return within(this.root).queryByRole("option", { name });
  }

  noResults() {
    return within(this.root).getByText("No results");
  }

  newPropertyItem() {
    return this.item("New property");
  }

  helpItem() {
    return this.item("Learn about properties");
  }

  deletedPropertiesItem() {
    return this.item("Deleted properties");
  }

  deletedCount(value: number) {
    return within(this.deletedPropertiesItem()).getByText(String(value));
  }

  moveHandle(name: string) {
    return within(this.root).getByRole("button", { name: `Move ${name}` });
  }

  visibilityButton(name: string) {
    return within(this.root).getByRole("button", {
      name: `Toggle ${name} visibility`,
    });
  }

  async search(value: string) {
    await this.user.type(this.searchInput(), value);
  }

  async openNewProperty() {
    await this.user.click(this.item("New property"));
    return PropertyTypesMenuObject.find(this.user);
  }

  async openDeletedProperties() {
    await this.user.click(this.item("Deleted properties"));
    return DeletedPropertiesMenuObject.find(this.user);
  }

  async backToViewSettings() {
    await this.back();
    return new MenuSurfaceObject(
      this.user,
      await findMenuByHeading("View Settings"),
    );
  }
}

export class PropertyTypesMenuObject extends MenuSurfaceObject {
  static async find(user: UserEvent) {
    return new PropertyTypesMenuObject(
      user,
      await findMenuByHeading("New property"),
    );
  }

  heading() {
    return super.heading("New property");
  }

  searchInput() {
    return within(this.root).getByPlaceholderText<HTMLInputElement>(
      "Search or add new property",
    );
  }

  type(name: string) {
    return within(this.root).getByRole("option", { name });
  }

  typeLabel() {
    return within(this.root).getByText("Type");
  }

  async backToProperties() {
    await this.back();
    return PropertiesMenuObject.find(this.user);
  }
}

export class DeletedPropertiesMenuObject extends MenuSurfaceObject {
  static async find(user: UserEvent) {
    return new DeletedPropertiesMenuObject(
      user,
      await findMenuByHeading("Deleted properties"),
    );
  }

  heading() {
    return super.heading("Deleted properties");
  }

  property(name: string) {
    return this.item(name);
  }

  queryProperty(name: string) {
    return this.queryItem(name);
  }

  restoreButton(name: string) {
    return within(this.root).getByRole("button", { name: `Restore ${name}` });
  }

  deleteButton(name: string) {
    return within(this.root).getByRole("button", { name: `Delete ${name}` });
  }

  async restore(name: string) {
    await this.user.click(this.restoreButton(name));
    await waitFor(() => {
      if (this.queryProperty(name)) {
        throw new Error(`Expected restored property "${name}" to disappear`);
      }
    });
  }

  async delete(name: string) {
    await this.user.click(this.deleteButton(name));
    await waitFor(() => {
      if (this.queryProperty(name)) {
        throw new Error(`Expected deleted property "${name}" to disappear`);
      }
    });
  }

  async backToProperties() {
    await this.back();
    return PropertiesMenuObject.find(this.user);
  }
}
