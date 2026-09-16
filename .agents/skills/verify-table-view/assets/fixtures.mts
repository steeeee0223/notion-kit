import { test as base, expect } from "../../../../apps/e2e/tests/fixtures.ts";

export { expect };

export const test = base.extend<{ captureEvidence: void }>({
  captureEvidence: [
    async ({ page }, use, testInfo) => {
      await use();
      if (page.isClosed()) return;
      await testInfo.attach("page-aria", {
        body: await page.locator("body").ariaSnapshot(),
        contentType: "text/plain",
      });
      for (const id of [
        "controlled-state",
        "rendered-resource-state",
        "internal-state",
      ]) {
        const state = page.getByTestId(id);
        if ((await state.count()) !== 1) continue;
        await testInfo.attach(id, {
          body: (await state.textContent()) ?? "",
          contentType: "application/json",
        });
      }
    },
    { auto: true },
  ],
});
