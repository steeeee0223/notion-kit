import type { Locator, Page } from "@playwright/test";

import { MenuSurfaceObject } from "./menu-surface";

export class SortMenuObject extends MenuSurfaceObject {
  constructor(page: Page, root: Locator) {
    super(page, root);
  }

  static open(page: Page) {
    const menu = MenuSurfaceObject.withHeading(page, "Sort");
    return new SortMenuObject(page, menu.root);
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
}
