import { fireEvent, screen, waitFor } from "@testing-library/react";
import { expect, it } from "vitest";

import { NumberConfigMenuObject } from "@/__tests__/component-objects/number-config-menu";
import { renderTableView } from "@/__tests__/component-objects/render-table-view";
import { mockResizeObserver } from "@/__tests__/mock";

mockResizeObserver();

async function openDoneCalculation() {
  const tableView = renderTableView();
  fireEvent.click(screen.getByRole("button", { name: "Done calculation" }));
  return {
    tableView,
    menu: await NumberConfigMenuObject.fromOpenMenu(tableView.user),
  };
}

it("CalcMenu_CheckedCount_DisplaysComputedFooterResult", async () => {
  const { menu } = await openDoneCalculation();
  await menu.openSubmenu("Count");

  menu.choose("Checked");

  await waitFor(() =>
    expect(
      screen.getByRole("button", { name: "Done calculation" }),
    ).toHaveTextContent("2"),
  );
});

it("CalcMenu_UncheckedPercent_DisplaysComputedFooterResult", async () => {
  const { menu } = await openDoneCalculation();
  await menu.openSubmenu("Percent");

  menu.choose("Percent unchecked");

  await waitFor(() =>
    expect(
      screen.getByRole("button", { name: "Done calculation" }),
    ).toHaveTextContent("33.3%"),
  );
});

it("CalcMenu_CappedCountToggle_UpdatesSwitchState", async () => {
  const { menu } = await openDoneCalculation();
  await menu.openSubmenu("Count");
  const capped = menu.checkbox("Show large counts as 99+");

  fireEvent.click(capped);

  expect(capped).toHaveAttribute("aria-checked", "true");
});
