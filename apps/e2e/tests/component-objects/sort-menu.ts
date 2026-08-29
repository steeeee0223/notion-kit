import type { Locator, Page } from "@playwright/test";

import { MenuSurfaceObject, type AccessibleName } from "./menu-surface";

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

  rule(propertyId: string) {
    return this.root.getByTestId(`sort-rule-${propertyId}`);
  }

  direction(propertyId: string) {
    return this.rule(propertyId).getByRole("combobox", {
      name: "Sort direction select",
    });
  }

  removeButton(propertyId: string) {
    return this.rule(propertyId).getByRole("button", { name: "Remove sort" });
  }

  async add(propertyName: string) {
    await this.item("Add sort").click();
    await this.searchInput().fill(propertyName);
    await this.page.getByRole("option", { name: propertyName }).click();
  }

  async setDirection(propertyId: string, next: AccessibleName) {
    await this.direction(propertyId).click();
    await this.page.getByRole("option", { name: next }).click();
  }

  async deleteAll() {
    await this.item("Delete sort").click();
  }

  async remove(propertyId: string) {
    await this.removeButton(propertyId).click();
  }
}
