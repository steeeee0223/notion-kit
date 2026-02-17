import { screen, waitFor } from "@testing-library/react";
import userEvent, { UserEvent } from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { renderSelectTable } from "../__tests__/utils";
import { mockResizeObserver } from "../../../__tests__/mock";

mockResizeObserver();

async function openSelectConfigMenu(user: UserEvent, columnName = "Status") {
  renderSelectTable({ preselected: "single" });

  // Find the column header button and click to open the PropMenu dropdown
  const headerCell = screen.getByRole("button", { name: columnName });
  await user.click(headerCell);

  // The PropMenu dropdown should be open — find "Edit property" sub-trigger
  const editPropertyTrigger = screen.getByRole("menuitem", {
    name: /edit property/i,
  });
  expect(editPropertyTrigger).toBeInTheDocument();

  // Hover the sub-trigger to open the config submenu
  // DropdownMenuSubTrigger opens on hover in Radix
  await user.hover(editPropertyTrigger);

  // Wait for the submenu to appear
  await new Promise((r) => setTimeout(r, 100));

  // The config submenu should now be visible with "Options" label
  expect(screen.getByText("Options")).toBeInTheDocument();
}

describe("SelectConfigMenu", () => {
  // --- Tests that work in jsdom ---

  it("Flow 14: should delete an option", async () => {
    const user = userEvent.setup();
    await openSelectConfigMenu(user);

    // Click on "Option A" to open its popover
    const optionAItem = screen.getByRole("menuitem", { name: "Option A" });
    await user.click(optionAItem);

    // Wait for popover to render, then click Delete
    await waitFor(() => {
      expect(
        screen.getByRole("menuitem", { name: /delete/i }),
      ).toBeInTheDocument();
    });
    const deleteItem = screen.getByRole("menuitem", { name: /delete/i });
    await user.click(deleteItem);

    // Option A should be removed from the list
    const remainingItems = screen.queryByRole("menuitem", {
      name: "Option A",
    });
    expect(remainingItems).not.toBeInTheDocument();
  });

  // --- Tests skipped due to jsdom limitations ---
  // These tests involve Popover or nested DropdownMenu components
  // inside DropdownMenuSubContent, which don't fully render in jsdom.
  // They should be verified in Storybook or integration tests instead.
  it.skip("Flow 9: should add an option via config '+' button — Popover doesn't re-render in jsdom", async () => {
    const user = userEvent.setup();
    await openSelectConfigMenu(user);

    const addButton = screen.getByRole("button", { name: "Add" });
    await user.click(addButton);

    const input = screen.getByRole("textbox");
    expect(input).toBeInTheDocument();

    await user.type(input, "New Status{Enter}");
    expect(screen.getByText("New Status")).toBeInTheDocument();
  });

  it.skip("Flow 10: should show error when adding duplicate option name — Popover doesn't re-render in jsdom", async () => {
    const user = userEvent.setup();
    await openSelectConfigMenu(user);

    const addButton = screen.getByRole("button", { name: /add/i });
    await user.click(addButton);

    const input = screen.getByRole("textbox");
    await user.type(input, "Option A{Enter}");
    expect(screen.getByText("Option already exists.")).toBeInTheDocument();
  });

  it.skip("Flow 11: option edit popover — Popover inside DropdownMenuSubContent doesn't render in jsdom", async () => {
    const user = userEvent.setup();
    await openSelectConfigMenu(user);

    const optionA = screen.getByRole("menuitem", { name: "Option A" });
    await user.click(optionA);

    await waitFor(() => {
      expect(screen.getByDisplayValue("Option A")).toBeInTheDocument();
    });
  });

  it.skip("Flow 12: should edit option name — Popover inside DropdownMenuSubContent doesn't render in jsdom", async () => {
    const user = userEvent.setup();
    await openSelectConfigMenu(user);

    const optionA = screen.getByRole("menuitem", { name: "Option A" });
    await user.click(optionA);

    await waitFor(() => {
      expect(screen.getByDisplayValue("Option A")).toBeInTheDocument();
    });
    const nameInput = screen.getByDisplayValue("Option A");
    await user.clear(nameInput);
    await user.type(nameInput, "Renamed Option{Enter}");

    await waitFor(() => {
      expect(screen.getByText("Renamed Option")).toBeInTheDocument();
    });
  });

  it.skip("Flow 13: should change option color — Popover inside DropdownMenuSubContent doesn't render in jsdom", async () => {
    const user = userEvent.setup();
    await openSelectConfigMenu(user);

    const optionA = screen.getByRole("menuitem", { name: "Option A" });
    await user.click(optionA);

    await waitFor(() => {
      expect(screen.getByText("Colors")).toBeInTheDocument();
    });

    const redColor = screen.getByRole("menuitem", { name: /red/i });
    await user.click(redColor);
  });

  it.skip("Flow 15: should open sort dropdown — nested DropdownMenuContent doesn't render in jsdom", async () => {
    const user = userEvent.setup();
    await openSelectConfigMenu(user);

    const sort = screen.getByRole("menuitem", { name: /sort options/i });
    await user.click(sort);

    expect(
      screen.getByRole("menuitemcheckbox", { name: /manual/i }),
    ).toBeInTheDocument();
  });

  it.skip("Flow 15b: should change sort to alphabetical — nested DropdownMenuContent doesn't render in jsdom", async () => {
    const user = userEvent.setup();
    await openSelectConfigMenu(user);

    const sort = screen.getByRole("menuitem", { name: /sort options/i });
    await user.click(sort);

    const alphabetical = screen.getByRole("menuitemcheckbox", {
      name: /alphabetical/i,
    });
    await user.click(alphabetical);

    const menuItems = screen.getAllByRole("menuitem");
    const optionTexts = menuItems
      .map((el) => el.textContent?.trim())
      .filter(
        (t) =>
          t?.includes("Option A") ||
          t?.includes("Option B") ||
          t?.includes("Option C"),
      );
    expect(optionTexts[0]).toContain("Option A");
    expect(optionTexts[1]).toContain("Option B");
    expect(optionTexts[2]).toContain("Option C");
  });
});
