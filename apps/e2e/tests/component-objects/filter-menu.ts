import { expect, type Locator, type Page } from "@playwright/test";

export class FilterMenuObject {
  constructor(
    private readonly page: Page,
    readonly root: Locator,
  ) {}

  static async open(page: Page) {
    const root = page.getByRole("dialog", { name: "Filters", exact: true });
    await expect(root).toBeVisible();
    return new FilterMenuObject(page, root);
  }

  menu() {
    return this.root.getByRole("region", { name: "Filters", exact: true });
  }

  rule() {
    return this.menu().getByRole("group", {
      name: "Filter rule",
      exact: true,
    });
  }

  property() {
    return this.rule().getByRole("combobox", {
      name: "Property select",
      exact: true,
    });
  }

  operator() {
    return this.rule().getByRole("combobox", {
      name: "Operator select",
      exact: true,
    });
  }

  value() {
    return this.rule().getByRole("textbox", { name: "Value", exact: true });
  }

  valueSelect() {
    return this.rule().getByRole("combobox", {
      name: "Value select",
      exact: true,
    });
  }

  async addRule() {
    await this.menu()
      .getByRole("button", { name: "Add filter rule", exact: true })
      .click();
    await this.page
      .getByRole("menuitem", { name: "Add filter rule", exact: true })
      .click();
    await expect(this.rule()).toBeVisible();
  }

  async chooseProperty(name: string) {
    await this.property().click();
    await this.page.getByRole("option", { name, exact: true }).click();
  }

  async chooseOperator(name: string) {
    await this.operator().click();
    await this.page.getByRole("option", { name, exact: true }).click();
  }

  async chooseValue(name: string) {
    await this.valueSelect().click();
    await this.page.getByRole("option", { name, exact: true }).click();
  }

  async delete() {
    await this.menu()
      .getByRole("menuitem", { name: "Delete filter", exact: true })
      .click();
  }
}
