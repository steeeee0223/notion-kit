import type { Locator, Page } from "@playwright/test";

import { MenuSurfaceObject } from "./menu-surface";

export class SortMenuObject extends MenuSurfaceObject {
  constructor(page: Page, root: Locator) {
    super(page, root);
  }

  static open(page: Page) {
    const addSort = page.getByRole("menuitem", { name: "Add sort" });
    return new SortMenuObject(
      page,
      page.getByRole("menu").filter({ has: addSort }).last(),
    );
  }

  searchInput() {
    return this.page.getByPlaceholder("Search for a property...");
  }

  direction(name: "Ascending" | "Descending") {
    return this.root.getByRole("combobox", { name });
  }

  removeButton(propertyName: string) {
    return this.root.getByRole("button", {
      name: `Remove ${propertyName} sort`,
    });
  }

  async add(propertyName: string) {
    await this.item("Add sort").click();
    await this.searchInput().fill(propertyName);
    await this.page.getByRole("option", { name: propertyName }).click();
  }

  async setDirection(
    current: "Ascending" | "Descending",
    next: "Ascending" | "Descending",
  ) {
    await this.direction(current).click();
    await this.page.getByRole("option", { name: next }).click();
  }

  async deleteAll() {
    await this.item("Delete sort").click();
  }

  async remove(propertyName: string) {
    await this.removeButton(propertyName).click();
  }
}
