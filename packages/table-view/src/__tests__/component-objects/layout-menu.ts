import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import type { UserEvent } from "@testing-library/user-event";

import { MenuSurfaceObject } from "./menu-surface";

type Layout = "Table" | "Board" | "Timeline" | "Calendar" | "List";
type RowView = "Side peek" | "Center peek" | "Full page";

export class LayoutMenuObject extends MenuSurfaceObject {
  static async find(user: UserEvent) {
    const menu = await MenuSurfaceObject.findByHeading(user, "Layout");
    return new LayoutMenuObject(user, menu.root);
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
    return screen.getByRole("menuitemradio", { name });
  }

  queryRowViewOption(name: RowView) {
    return screen.queryByRole("menuitemradio", { name });
  }

  datePropertyTrigger() {
    return within(this.root).getByRole("menuitem", {
      name: /(Timeline|Calendar) by/i,
    });
  }

  datePropertyOption(name: string) {
    return screen.getByRole("menuitemradio", { name });
  }

  queryDatePropertyOption(name: string) {
    return screen.queryByRole("menuitemradio", { name });
  }

  async selectLayout(name: Layout) {
    await this.user.click(this.layoutButton(name));
  }

  async openRowViewOptions() {
    await this.user.hover(this.rowViewTrigger());
    await screen.findByRole("menuitemradio", { name: "Side peek" });
  }

  async openDatePropertyOptions() {
    await this.user.hover(this.datePropertyTrigger());
    await screen.findByRole("menuitemradio", { name: "Due" });
  }

  async selectDateProperty(name: string) {
    await this.openDatePropertyOptions();
    fireEvent.click(this.datePropertyOption(name));
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
    return MenuSurfaceObject.findByHeading(this.user, "View Settings");
  }
}
