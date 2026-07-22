import type { Locator, Page } from "@playwright/test";

import { MenuSurfaceObject, type AccessibleName } from "./menu-surface";

export class HeaderMenuObject extends MenuSurfaceObject {
  constructor(page: Page, root: Locator) {
    super(page, root);
  }

  static open(page: Page) {
    const groupItem = page.getByRole("menuitem", {
      name: "Group",
      exact: true,
    });
    return new HeaderMenuObject(
      page,
      page.getByRole("menu").filter({ has: groupItem }).last(),
    );
  }

  async chooseSubmenu(trigger: AccessibleName, option: AccessibleName) {
    await this.item(trigger).hover();
    await this.page.getByRole("menuitem", { name: option }).last().click();
  }

  async sort(direction: "ascending" | "descending") {
    await this.chooseSubmenu("Sort", `Sort ${direction}`);
  }

  async group() {
    await this.item(/^(Group|Ungroup)$/).click();
  }

  async calculate(method: AccessibleName) {
    await this.chooseSubmenu("Calculate", method);
  }

  async toggleFreeze() {
    await this.item(/^(Freeze up to column|Unfreeze columns)$/).click();
  }

  async hide() {
    await this.item("Hide in view").click();
  }

  async toggleWrap() {
    await this.item(/^(Wrap|Unwrap) text$/).click();
  }

  async insert(side: "left" | "right") {
    await this.item(`Insert ${side}`).click();
  }

  async duplicate() {
    await this.item("Duplicate property").click();
  }

  async delete() {
    await this.item("Delete property").click();
  }

  async changeType(typeName: AccessibleName) {
    await this.chooseSubmenu("Change type", typeName);
  }

  async openPluginConfig(name: AccessibleName = "Edit property") {
    await this.item(name).hover();
    return new MenuSurfaceObject(this.page, this.page.getByRole("menu").last());
  }
}
