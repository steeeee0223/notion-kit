import * as React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent, {
  PointerEventsCheckLevel,
  type UserEvent,
} from "@testing-library/user-event";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@notion-kit/ui/primitives";

export class NumberConfigMenuObject {
  constructor(readonly user: UserEvent) {}

  static async fromOpenMenu(user: UserEvent) {
    await waitFor(() => screen.getAllByRole("menu")[0]);
    return new NumberConfigMenuObject(user);
  }

  static async renderOpen(children: React.ReactNode) {
    const user = userEvent.setup({
      pointerEventsCheck: PointerEventsCheckLevel.Never,
    });
    render(
      React.createElement(
        DropdownMenu,
        { defaultOpen: true, modal: false },
        React.createElement(DropdownMenuTrigger, {
          render: React.createElement("button", { type: "button" }, "Open"),
        }),
        React.createElement(DropdownMenuContent, null, children),
      ),
    );
    return await NumberConfigMenuObject.fromOpenMenu(user);
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

  choose(name: string) {
    fireEvent.click(this.checkbox(name));
  }
}
