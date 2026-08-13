import type { Locator, Page } from "@playwright/test";

import { MenuSurfaceObject } from "./menu-surface";

export class PropertiesMenuObject extends MenuSurfaceObject {
  constructor(page: Page, root: Locator) {
    super(page, root);
  }

  static open(page: Page) {
    const menu = MenuSurfaceObject.withHeading(page, "Properties");
    return new PropertiesMenuObject(page, menu.root);
  }

  property(name: string) {
    return this.root.getByRole("option", { name });
  }

  visibilityButton(name: string) {
    return this.root.getByRole("button", {
      name: `Toggle ${name} visibility`,
    });
  }

  async openProperty(name: string) {
    await this.property(name).click();
    return MenuSurfaceObject.withHeading(this.page, "Edit property");
  }

  async createTextProperty(name: string) {
    await this.item("New property").click();
    const types = MenuSurfaceObject.withHeading(this.page, "New property");
    const input = types.root.getByPlaceholder("Search or add new property");
    await input.fill(name);
    await types.root.getByRole("option", { name, exact: true }).click();
    return MenuSurfaceObject.withHeading(this.page, "Edit property");
  }

  async openDeletedProperties() {
    await this.item("Deleted properties").click();
    return MenuSurfaceObject.withHeading(this.page, "Deleted properties");
  }
}
