import { screen, within } from "@testing-library/react";
import type { UserEvent } from "@testing-library/user-event";

export class EditLogDialogObject {
  constructor(
    readonly user: UserEvent,
    readonly root: HTMLElement,
  ) {}

  static async find(user: UserEvent) {
    return new EditLogDialogObject(
      user,
      await screen.findByRole("dialog", { name: "Edit log" }),
    );
  }

  entries() {
    return within(this.root).queryAllByRole("listitem");
  }
  region() {
    return within(this.root).getByRole("region", { name: "Edit log entries" });
  }
  text(text: string | RegExp) {
    return within(this.root).getByText(text);
  }
  findText(text: string | RegExp) {
    return within(this.root).findByText(text);
  }
  loadMoreButton() {
    return within(this.root).queryByRole("button", { name: "Load more" });
  }
  async loadMore() {
    await this.user.click(
      within(this.root).getByRole("button", { name: "Load more" }),
    );
  }
  async retry() {
    await this.user.click(
      within(this.root).getByRole("button", { name: "Retry" }),
    );
  }
  closeButton() {
    return within(this.root).getByRole("button", { name: "Close" });
  }
  async close() {
    await this.user.click(this.closeButton());
  }
  async escape() {
    await this.user.keyboard("{Escape}");
  }
}
