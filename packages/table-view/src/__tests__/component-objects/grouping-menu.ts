import { within } from "@testing-library/react";
import type { UserEvent } from "@testing-library/user-event";

import { findMenuByHeading, MenuSurfaceObject } from "./menu-surface";

export class SelectGroupingMenuObject extends MenuSurfaceObject {
  static async find(user: UserEvent) {
    return new SelectGroupingMenuObject(
      user,
      await findMenuByHeading("Group by"),
    );
  }

  heading() {
    return super.heading("Group by");
  }

  searchInput() {
    return within(this.root).getByPlaceholderText<HTMLInputElement>(
      "Search for a property",
    );
  }

  option(name: string) {
    return within(this.root).getByRole("option", { name });
  }

  queryOption(name: string) {
    return within(this.root).queryByRole("option", { name });
  }

  async search(value: string) {
    await this.user.type(this.searchInput(), value);
  }

  async select(name: string) {
    await this.user.click(this.option(name));
    return EditGroupingMenuObject.find(this.user);
  }

  async backToViewSettings() {
    await this.back();
    return new MenuSurfaceObject(
      this.user,
      await findMenuByHeading("View Settings"),
    );
  }
}

export class EditGroupingMenuObject extends MenuSurfaceObject {
  static async find(user: UserEvent) {
    return new EditGroupingMenuObject(user, await findMenuByHeading("Group"));
  }

  heading() {
    return super.heading("Group");
  }

  groupByItem() {
    return this.item("Group by");
  }

  selectedProperty(name: string) {
    return within(this.groupByItem()).getByText(name);
  }

  hideEmptyGroupsItem() {
    return within(this.root).getByRole("menuitemcheckbox", {
      name: "Hide empty groups",
    });
  }

  groupsLabel() {
    return within(this.root).getByText("Groups");
  }

  allVisibilityButton() {
    return within(this.root).getByRole("button", {
      name: /^(Hide|Show) all$/,
    });
  }

  removeGroupingItem() {
    return this.item("Remove grouping");
  }

  helpItem() {
    return this.item("Learn about grouping");
  }

  moveHandle(groupId: string) {
    return within(this.root).getByRole("button", {
      name: `Move ${groupId} group`,
    });
  }

  firstMoveHandle() {
    return within(this.root).getAllByRole("button", {
      name: /^Move .+ group$/,
    })[0]!;
  }

  visibilityButton(groupId: string) {
    return within(this.root).getByRole("button", {
      name: `Toggle ${groupId} group visibility`,
    });
  }

  firstVisibilityButton() {
    return within(this.root).getAllByRole("button", {
      name: /^Toggle .+ group visibility$/,
    })[0]!;
  }

  async changeGrouping() {
    await this.user.click(this.groupByItem());
    return SelectGroupingMenuObject.find(this.user);
  }

  async removeGrouping() {
    await this.user.click(this.removeGroupingItem());
    await this.waitUntilClosed();
  }

  async toggleHideEmptyGroups() {
    await this.user.click(this.hideEmptyGroupsItem());
  }

  async toggleFirstGroupVisibility() {
    await this.user.click(this.firstVisibilityButton());
  }

  async backToViewSettings() {
    await this.back();
    return new MenuSurfaceObject(
      this.user,
      await findMenuByHeading("View Settings"),
    );
  }
}
