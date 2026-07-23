import type { Locator, Page } from "@playwright/test";

import { MenuSurfaceObject } from "./menu-surface";

export class GroupActionsObject {
  constructor(
    private readonly page: Page,
    readonly group: Locator,
  ) {}

  async openOptions() {
    await this.group.hover();
    await this.group.getByRole("button", { name: "Group options" }).click();
    return new MenuSurfaceObject(this.page, this.page.getByRole("menu").last());
  }

  async addRow() {
    await this.group.hover();
    await this.group.getByRole("button", { name: "Add row" }).click();
  }

  aggregationCount(count: number) {
    return this.group.getByRole("button", { name: String(count), exact: true });
  }
}
