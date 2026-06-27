import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import type { UserEvent } from "@testing-library/user-event";

import { findMenuByHeading, MenuSurfaceObject } from "./menu-surface";

type Layout = "Table" | "Board" | "List";
type RowView = "Side peek" | "Center peek" | "Full page";

export class LayoutMenuObject extends MenuSurfaceObject {
  static async find(user: UserEvent) {
    return new LayoutMenuObject(user, await findMenuByHeading("Layout"));
  }

  heading() {
    return super.heading("Layout");
  }

  layoutButton(name: Layout) {
    return within(this.root).getByRole("button", { name });
  }

  rowViewTrigger() {
    return within(this.root).getByRole("menuitem", { name: /Open pages in/i });
  }

  rowViewOption(name: RowView) {
    return screen.getByRole("menuitemcheckbox", { name });
  }

  queryRowViewOption(name: RowView) {
    return screen.queryByRole("menuitemcheckbox", { name });
  }

  async selectLayout(name: Layout) {
    await this.user.click(this.layoutButton(name));
  }

  async openRowViewOptions() {
    await this.user.hover(this.rowViewTrigger());
    await screen.findByRole("menuitemcheckbox", { name: "Side peek" });
  }

  async selectRowView(name: RowView) {
    await this.openRowViewOptions();
    fireEvent.click(this.rowViewOption(name));
    await waitFor(() => {
      if (!this.rowViewTrigger().textContent.includes(name)) {
        throw new Error(`Expected row view trigger to show "${name}"`);
      }
    });
  }

  async backToViewSettings() {
    await this.back();
    return new MenuSurfaceObject(
      this.user,
      await findMenuByHeading("View Settings"),
    );
  }
}
