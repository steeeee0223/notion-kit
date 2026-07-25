import type { Locator, Page } from "@playwright/test";

import { MenuSurfaceObject } from "./menu-surface";

export class GroupingMenuObject extends MenuSurfaceObject {
  constructor(page: Page, root: Locator) {
    super(page, root);
  }

  static open(page: Page) {
    const groupHeading = page.getByRole("heading", {
      name: /^(Group|Group by)$/,
    });
    return new GroupingMenuObject(
      page,
      page.getByRole("menu").filter({ has: groupHeading }).last(),
    );
  }

  searchInput() {
    return this.root.getByPlaceholder("Search for a property");
  }

  async choose(propertyName: string) {
    await this.searchInput().fill(propertyName);
    await this.root.getByRole("option", { name: propertyName }).click();
    return GroupingMenuObject.open(this.page);
  }

  async changeProperty() {
    await this.item("Group by").click();
    return GroupingMenuObject.open(this.page);
  }

  async toggleHideEmptyGroups() {
    await this.checkboxItem("Hide empty groups").click();
  }

  visibilityButton(groupId: string) {
    return this.root.getByRole("button", {
      name: `Toggle ${groupId} group visibility`,
    });
  }

  allVisibilityButton() {
    return this.root.getByRole("button", { name: /^(Hide|Show) all$/ });
  }

  async toggleGroup(groupId: string) {
    await this.visibilityButton(groupId).click();
  }

  async toggleAll() {
    await this.allVisibilityButton().click();
  }

  async remove() {
    await this.item("Remove grouping").click();
  }
}
