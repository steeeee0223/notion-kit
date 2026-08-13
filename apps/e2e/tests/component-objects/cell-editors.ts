import type { Locator, Page } from "@playwright/test";

import type { AccessibleName } from "./menu-surface";

export class CellEditorsObject {
  constructor(
    private readonly page: Page,
    readonly trigger: Locator,
  ) {}

  async open() {
    await this.trigger.click();
    return this;
  }

  textbox() {
    return this.page.getByRole("textbox").last();
  }

  combobox() {
    return this.page.getByRole("combobox").last();
  }

  option(name: AccessibleName) {
    return this.page.getByRole("option", { name }).last();
  }

  async fill(value: string) {
    await this.open();
    await this.textbox().fill(value);
    await this.textbox().press("Enter");
  }

  async choose(name: AccessibleName) {
    await this.open();
    await this.option(name).click();
  }

  async clearWithBackspace() {
    await this.combobox().click();
    await this.combobox().press("Backspace");
  }

  async chooseDate(name: AccessibleName) {
    await this.open();
    await this.page.getByRole("gridcell", { name }).click();
  }
}
