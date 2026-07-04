import { fireEvent, waitFor, within } from "@testing-library/react";
import type { UserEvent } from "@testing-library/user-event";

type Matcher = string | RegExp;

async function findOpenMenu(
  description: string,
  predicate: (menu: HTMLElement) => boolean,
) {
  return waitFor(() => {
    const menu = Array.from(
      document.querySelectorAll<HTMLElement>(
        "[data-slot='dropdown-menu-content']",
      ),
    ).find(predicate);
    if (!menu) throw new Error(`Expected open menu: ${description}`);
    return menu;
  });
}

export class SelectConfigMenuObject {
  constructor(
    readonly user: UserEvent,
    readonly root: HTMLElement,
  ) {}

  static async find(user: UserEvent) {
    const root = await findOpenMenu("select config menu", (menu) => {
      return (
        within(menu).queryByText("Options") !== null &&
        within(menu).queryByRole("menuitem", { name: /sort options/i }) !== null
      );
    });

    return new SelectConfigMenuObject(user, root);
  }

  label(name: string) {
    return within(this.root).getByText(name);
  }

  addButton() {
    return this.root.querySelector<HTMLButtonElement>("[aria-label='Add']");
  }

  closeAddButton() {
    return this.root.querySelector<HTMLButtonElement>("[aria-label='Close']");
  }

  addInput() {
    return within(this.root).getByRole<HTMLInputElement>("textbox");
  }

  duplicateError() {
    return within(this.root).getByText("Option already exists.");
  }

  sortTrigger() {
    return within(this.root).getByRole("menuitem", { name: /sort options/i });
  }

  option(name: string) {
    return within(this.root).getByRole("menuitem", { name });
  }

  queryOption(name: string) {
    return within(this.root).queryByRole("menuitem", { name });
  }

  moveHandle(name: string) {
    return within(this.option(name)).getByRole("button", {
      name: `Move ${name}`,
    });
  }

  sortableList() {
    return this.root.querySelector("[data-slot='sortable-list']");
  }

  optionNames(names: string[]) {
    return within(this.root)
      .getAllByRole("menuitem")
      .map((item) => item.textContent.trim())
      .filter((text) => names.includes(text));
  }

  async clickAdd() {
    const button = this.addButton();
    if (!button) throw new Error("Expected add option button");
    await this.user.click(button);
  }

  async addOption(name: string) {
    await this.clickAdd();
    await this.user.type(this.addInput(), `${name}{Enter}`);
    await this.waitForOption(name);
  }

  async tryAddOption(name: string) {
    await this.clickAdd();
    await this.user.type(this.addInput(), name);
  }

  async openSortMenu() {
    await this.user.hover(this.sortTrigger());
    const root = await findOpenMenu("select option sort menu", (menu) => {
      return (
        within(menu).queryByRole("menuitemcheckbox", { name: "Manual" }) !==
        null
      );
    });
    return new SelectConfigSortMenuObject(this.user, root);
  }

  async openOptionMenu(name: string) {
    fireEvent.click(this.option(name));
    const root = await findOpenMenu(
      `select option menu for ${name}`,
      (menu) => {
        return (
          within(menu).queryByText("Colors") !== null &&
          within(menu).queryByRole("menuitem", { name: "Delete" }) !== null
        );
      },
    );
    return new SelectOptionConfigMenuObject(this.user, root);
  }

  async deleteOption(name: string) {
    const optionMenu = await this.openOptionMenu(name);
    await optionMenu.delete();
    if (this.queryOption(name)) {
      throw new Error(`Expected option "${name}" to disappear`);
    }
  }

  async waitForOption(name: string) {
    await waitFor(() => within(this.root).getByRole("menuitem", { name }));
  }
}

export class SelectConfigSortMenuObject {
  constructor(
    readonly user: UserEvent,
    readonly root: HTMLElement,
  ) {}

  item(name: Matcher) {
    return within(this.root).getByRole("menuitemcheckbox", { name });
  }

  choose(name: Matcher) {
    fireEvent.click(this.item(name));
  }
}

export class SelectOptionConfigMenuObject {
  constructor(
    readonly user: UserEvent,
    readonly root: HTMLElement,
  ) {}

  nameInput() {
    return within(this.root).getByRole<HTMLInputElement>("textbox");
  }

  color(name: Matcher) {
    return within(this.root).getByRole("menuitemcheckbox", { name });
  }

  colorsLabel() {
    return within(this.root).getByText("Colors");
  }

  async rename(name: string) {
    await this.user.clear(this.nameInput());
    await this.user.type(this.nameInput(), `${name}{Enter}`);
  }

  async chooseColor(name: Matcher) {
    await this.user.click(this.color(name));
  }

  async delete() {
    await this.user.click(
      within(this.root).getByRole("menuitem", { name: "Delete" }),
    );
  }
}
