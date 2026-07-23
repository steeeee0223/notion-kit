import type { Locator, Page } from "@playwright/test";

export type AccessibleName = string | RegExp;

export class MenuSurfaceObject {
  constructor(
    protected readonly page: Page,
    readonly root: Locator,
  ) {}

  static withHeading(page: Page, name: AccessibleName) {
    const heading = page.getByRole("heading", { name });
    return new MenuSurfaceObject(
      page,
      page.getByRole("menu").filter({ has: heading }).last(),
    );
  }

  heading(name: AccessibleName) {
    return this.root.getByRole("heading", { name });
  }

  item(name: AccessibleName) {
    return this.root.getByRole("menuitem", { name });
  }

  checkboxItem(name: AccessibleName) {
    return this.root.getByRole("menuitemcheckbox", { name });
  }

  option(name: AccessibleName) {
    return this.root.getByRole("option", { name });
  }

  button(name: AccessibleName) {
    return this.root.getByRole("button", { name });
  }

  text(value: AccessibleName) {
    return this.root.getByText(value);
  }

  async back() {
    await this.button("Back").click();
  }

  async close() {
    await this.button("Close").click();
  }
}
