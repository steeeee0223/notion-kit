import type { Locator, Page } from "@playwright/test";

import { MenuSurfaceObject, type AccessibleName } from "./menu-surface";

export class HeaderMenuObject extends MenuSurfaceObject {
  constructor(page: Page, root: Locator) {
    super(page, root);
  }

  static open(page: Page) {
    const groupItem = page.getByRole("menuitem", {
      name: /^(Group|Ungroup)$/,
    });
    return new HeaderMenuObject(
      page,
      page.getByRole("menu").filter({ has: groupItem }).last(),
    );
  }

  private async movePointerTo(target: Locator) {
    await target.waitFor({ state: "visible" });
    const box = await target.boundingBox();
    if (!box) throw new Error("Menu target has no visible bounding box");
    const point = {
      x: box.x + box.width / 2,
      y: box.y + box.height / 2,
    };
    await this.page.mouse.move(point.x, point.y, { steps: 12 });
    return point;
  }

  async chooseSubmenu(trigger: AccessibleName, option: AccessibleName) {
    await this.item(trigger).dispatchEvent("click");
    const optionItem = this.page
      .getByRole("menuitem", { name: option })
      .last();
    await optionItem.waitFor({ state: "visible" });
    await optionItem.dispatchEvent("click");
    await this.page.mouse.click(0, 0);
    await this.root.waitFor({ state: "hidden" });
  }

  async sort(direction: "ascending" | "descending") {
    await this.chooseSubmenu("Sort", `Sort ${direction}`);
  }

  async group() {
    await this.item(/^(Group|Ungroup)$/).click();
  }

  async calculate(method: AccessibleName) {
    if (typeof method !== "string") {
      throw new Error("Calculation methods must use an exact accessible name");
    }
    await this.item("Calculate").hover();
    const category = method.startsWith("Percent") ? "Percent" : "Count";
    const categoryItem = this.page
      .getByRole("menuitem", { name: category, exact: true })
      .last();
    await this.movePointerTo(categoryItem);
    const option = this.page
      .getByRole("menuitemcheckbox", {
        name: method,
        exact: true,
      })
      .last();
    const point = await this.movePointerTo(option);
    await this.page.mouse.click(point.x, point.y);
    await option.waitFor({ state: "hidden" });
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
    await this.item("Change type").hover();
    const option = this.page
      .getByRole("option", {
        name: typeName,
        exact: typeof typeName === "string",
      })
      .last();
    await option.waitFor({ state: "visible" });
    await option.dispatchEvent("click");
    await this.root.waitFor({ state: "hidden" });
    return MenuSurfaceObject.withHeading(this.page, "Edit property");
  }

  async openPluginConfig(name: AccessibleName = "Edit property") {
    await this.item(name).hover();
    return new MenuSurfaceObject(this.page, this.page.getByRole("menu").last());
  }
}
