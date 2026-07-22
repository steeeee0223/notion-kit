import type { Locator, Page } from "@playwright/test";

import type { AccessibleName } from "./menu-surface";

export class RowActionsObject {
  constructor(
    private readonly page: Page,
    readonly root: Locator,
  ) {}

  static open(page: Page) {
    return new RowActionsObject(page, page.getByRole("dialog").last());
  }

  searchInput() {
    return this.root.getByPlaceholder("Search actions...");
  }

  option(name: AccessibleName) {
    return this.root.getByRole("option", { name });
  }

  async search(value: string) {
    await this.searchInput().fill(value);
  }

  async choose(name: AccessibleName) {
    await this.option(name).click();
  }

  async editIcon() {
    await this.choose("Edit icon");
  }

  async openRow() {
    await this.choose(/Open in (side|center|full page)/i);
  }

  async openInNewTab() {
    await this.choose("Open in new tab");
  }

  async copyLink() {
    await this.choose("Copy link");
  }

  async duplicate() {
    await this.choose("Duplicate");
  }

  async delete() {
    await this.choose("Delete");
  }

  async press(shortcut: string) {
    await this.page.keyboard.press(shortcut);
  }
}
