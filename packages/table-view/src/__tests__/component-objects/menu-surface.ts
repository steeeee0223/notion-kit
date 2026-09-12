import { screen, waitFor, within } from "@testing-library/react";
import type { UserEvent } from "@testing-library/user-event";

async function findMenuRootByHeading(name: string) {
  return waitFor(() => {
    const root = screen
      .getAllByRole("menu")
      .find((menu) => within(menu).queryByRole("heading", { name }));

    if (!root) throw new Error(`Expected an open menu headed "${name}"`);
    return root;
  });
}

async function findMenuRootByItem(name: string | RegExp) {
  return waitFor(() => {
    const root = screen
      .getAllByRole("menu")
      .find((menu) => within(menu).queryByRole("menuitem", { name }));

    if (!root) throw new Error(`Expected an open menu containing "${name}"`);
    return root;
  });
}

export class MenuSurfaceObject {
  static async findByHeading(user: UserEvent, name: string) {
    return new MenuSurfaceObject(user, await findMenuRootByHeading(name));
  }

  static async findByItem(user: UserEvent, name: string | RegExp) {
    return new MenuSurfaceObject(user, await findMenuRootByItem(name));
  }

  constructor(
    protected readonly user: UserEvent,
    readonly root: HTMLElement,
  ) {}

  heading(name: string) {
    return within(this.root).getByRole("heading", { name });
  }

  item(name: string | RegExp) {
    return within(this.root).getByRole("menuitem", { name });
  }

  option(name: string | RegExp) {
    return within(this.root).getByRole("option", { name });
  }

  queryItem(name: string | RegExp) {
    return within(this.root).queryByRole("menuitem", { name });
  }

  text(name: string | RegExp) {
    return within(this.root).getByText(name);
  }

  button(name: string | RegExp) {
    return within(this.root).getByRole("button", { name });
  }

  async back() {
    await this.user.click(this.button("Back"));
  }

  async close() {
    await this.user.click(this.button("Close"));
  }

  async waitUntilClosed() {
    await waitFor(() => {
      if (this.root.isConnected) throw new Error("Expected menu to close");
    });
  }
}
