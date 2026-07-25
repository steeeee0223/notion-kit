import type { Locator, Page } from "@playwright/test";

import { GroupingMenuObject } from "./grouping-menu";
import { MenuSurfaceObject } from "./menu-surface";
import { SortMenuObject } from "./sort-menu";

export class ViewSettingsMenuObject extends MenuSurfaceObject {
  constructor(page: Page, root: Locator) {
    super(page, root);
  }

  static open(page: Page) {
    const menu = MenuSurfaceObject.withHeading(page, "View Settings");
    return new ViewSettingsMenuObject(page, menu.root);
  }

  async openSort() {
    await this.item("Sort").click();
    return SortMenuObject.open(this.page);
  }

  async openGrouping() {
    await this.item("Group").click();
    return GroupingMenuObject.open(this.page);
  }

  async openLayout() {
    await this.item("Layout").click();
    return MenuSurfaceObject.withHeading(this.page, "Layout");
  }

  async openProperties() {
    await this.item("Edit properties").click();
    return MenuSurfaceObject.withHeading(this.page, "Properties");
  }

  async toggleLock() {
    await this.item(/^(Lock|Unlock) database$/).click();
  }
}
