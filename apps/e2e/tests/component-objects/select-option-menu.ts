import type { Page } from "@playwright/test";

import { MenuSurfaceObject } from "./menu-surface";

export class SelectOptionMenuObject extends MenuSurfaceObject {
  static open(page: Page) {
    return new SelectOptionMenuObject(
      page,
      page.getByRole("menu").filter({
        has: page.getByRole("group", { name: "Colors", exact: true }),
      }),
    );
  }

  colors() {
    return this.root.getByRole("group", { name: "Colors", exact: true });
  }

  color(name: string) {
    return this.colors().getByRole("menuitemradio", { name, exact: true });
  }

  checkmarks() {
    return this.colors().locator("svg");
  }

  colorCheckmark(name: string) {
    return this.color(name).locator("svg");
  }
}
