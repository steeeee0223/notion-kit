import { render, screen } from "@testing-library/react";
import userEvent, {
  PointerEventsCheckLevel,
  type UserEvent,
} from "@testing-library/user-event";

import { IconMenu, type IconMenuProps } from "@/icon-menu";

export class IconMenuObject {
  private constructor(readonly user: UserEvent) {}

  static render(props: Omit<IconMenuProps, "children">) {
    Element.prototype.getBoundingClientRect = () =>
      ({
        width: 400,
        height: 400,
        top: 0,
        left: 0,
        bottom: 400,
        right: 400,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      }) as DOMRect;

    const user = userEvent.setup({
      pointerEventsCheck: PointerEventsCheckLevel.Never,
    });

    render(
      <IconMenu {...props}>
        <span>Open Icons</span>
      </IconMenu>,
    );

    return new IconMenuObject(user);
  }

  trigger() {
    return screen.getByText("Open Icons");
  }

  tab(name: string) {
    return screen.getByRole("tab", { name });
  }

  queryTab(name: string) {
    return screen.queryByRole("tab", { name });
  }

  searchInput() {
    return screen.getByRole<HTMLInputElement>("searchbox");
  }

  removeButton() {
    return screen.getByRole("button", { name: /remove/i });
  }

  urlInput() {
    return screen.getByPlaceholderText<HTMLInputElement>(
      "Paste an image link...",
    );
  }

  submitButton() {
    return screen.getByRole("button", { name: /submit/i });
  }

  async open() {
    await this.user.click(this.trigger());
  }

  async selectTab(name: string) {
    await this.user.click(this.tab(name));
  }

  async search(value: string) {
    await this.user.type(this.searchInput(), value);
  }

  async remove() {
    await this.user.click(this.removeButton());
  }

  async submitUrl(url: string) {
    await this.selectTab("Upload");
    await this.user.type(this.urlInput(), url);
    await this.user.click(this.submitButton());
  }
}
