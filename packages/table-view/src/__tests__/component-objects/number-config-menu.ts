import { screen, waitFor } from "@testing-library/react";
import type { UserEvent } from "@testing-library/user-event";

export class NumberConfigMenuObject {
  constructor(readonly user: UserEvent) {}

  static async fromOpenMenu(user: UserEvent) {
    await waitFor(() => screen.getAllByRole("menu")[0]);
    return new NumberConfigMenuObject(user);
  }

  item(name: string | RegExp) {
    return screen.getByRole("menuitem", { name });
  }

  checkbox(name: string) {
    return screen.getByRole("menuitemcheckbox", { name });
  }

  queryCheckbox(name: string) {
    return screen.queryByRole("menuitemcheckbox", { name });
  }

  async openSubmenu(name: string | RegExp) {
    await this.user.hover(this.item(name));
    await waitFor(() => {
      if (screen.getAllByRole("menu").length < 2) {
        throw new Error(`Expected submenu "${name}" to open`);
      }
    });
  }

  async choose(name: string) {
    await this.user.click(this.checkbox(name));
  }
}
