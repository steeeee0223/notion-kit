import type { UserEvent } from "@testing-library/user-event";

import { SelectGroupingMenuObject } from "./grouping-menu";
import { LayoutMenuObject } from "./layout-menu";
import { findMenuByHeading, MenuSurfaceObject } from "./menu-surface";
import { PropertiesMenuObject } from "./properties-menu";

export class ViewSettingsMenuObject extends MenuSurfaceObject {
  static async find(user: UserEvent) {
    return new ViewSettingsMenuObject(
      user,
      await findMenuByHeading("View Settings"),
    );
  }

  heading() {
    return super.heading("View Settings");
  }

  async openPage(itemName: string | RegExp, heading: string) {
    await this.user.click(this.item(itemName));
    return new MenuSurfaceObject(this.user, await findMenuByHeading(heading));
  }

  async toggleLock() {
    await this.user.click(this.item(/^(Lock|Unlock) database$/));
  }

  async openProperties() {
    await this.user.click(this.item("Edit properties"));
    return PropertiesMenuObject.find(this.user);
  }

  async openSelectGrouping() {
    await this.user.click(this.item("Group"));
    return SelectGroupingMenuObject.find(this.user);
  }

  async openLayout() {
    await this.user.click(this.item("Layout"));
    return LayoutMenuObject.find(this.user);
  }

  groupingSelection(name: string) {
    return this.item("Group").textContent.includes(name);
  }

  lockItem() {
    return this.item(/^(Lock|Unlock) database$/);
  }
}
