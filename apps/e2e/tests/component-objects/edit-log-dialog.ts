import { expect, type Locator, type Page } from "@playwright/test";

export class EditLogDialogObject {
  readonly root: Locator;

  constructor(private readonly page: Page) {
    this.root = page.getByRole("dialog", { name: "Edit log", exact: true });
  }

  entries() {
    return this.root.getByRole("listitem");
  }

  viewport() {
    return this.root
      .getByRole("region", { name: "Edit log entries" })
      .locator('[data-slot="scroll-area-viewport"]');
  }

  loadMoreButton() {
    return this.root.getByRole("button", { name: "Load more", exact: true });
  }

  async waitForEntries(count: number) {
    await expect(this.root).toBeVisible();
    await expect(this.entries()).toHaveCount(count);
    await this.root.evaluate(async (element) => {
      await Promise.all(
        element
          .getAnimations()
          .map((animation) => animation.finished.catch(() => undefined)),
      );
    });
  }

  async scrollToEnd() {
    await this.viewport().evaluate((element) => {
      element.scrollTop = element.scrollHeight;
    });
    await expect(this.loadMoreButton()).toBeInViewport();
  }

  scrollPosition() {
    return this.viewport().evaluate((element) => element.scrollTop);
  }

  async loadMore() {
    await this.loadMoreButton().click();
  }

  async closeWithEscape() {
    await this.page.keyboard.press("Escape");
    await expect(this.root).toBeHidden();
  }

  async close() {
    await this.root.getByRole("button", { name: "Close", exact: true }).click();
    await expect(this.root).toBeHidden();
  }
}
