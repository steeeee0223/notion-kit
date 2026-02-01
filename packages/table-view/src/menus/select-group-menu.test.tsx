import { screen } from "@testing-library/react";
import userEvent, { UserEvent } from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { mockResizeObserver } from "../__tests__/mock";
import { openSettingsMenu } from "../__tests__/utils";

mockResizeObserver();

async function openSelectGroupMenu(user: UserEvent) {
  const menu = await openSettingsMenu(user);

  // Click Group menu item
  const groupMenuItem = screen.getByRole("menuitem", { name: /group/i });
  await user.click(groupMenuItem);

  expect(screen.getByRole("heading", { name: "Group by" })).toBeInTheDocument();

  return menu;
}

describe("SelectGroupMenu", () => {
  it("should display the Group by menu", async () => {
    const user = userEvent.setup();
    await openSelectGroupMenu(user);

    // Should show "Group by" header
    expect(
      screen.getByRole("heading", { name: "Group by" }),
    ).toBeInTheDocument();

    // Should show "None" option (CommandItem uses role="option")
    expect(screen.getByRole("option", { name: "None" })).toBeInTheDocument();

    // Should show property options
    expect(screen.getByRole("option", { name: "Name" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Done" })).toBeInTheDocument();
  });

  it("should show search input for filtering properties", async () => {
    const user = userEvent.setup();
    await openSelectGroupMenu(user);

    // Should have search input
    const searchInput = screen.getByPlaceholderText("Search for a property");
    expect(searchInput).toBeInTheDocument();
  });

  it("should filter properties when typing in search", async () => {
    const user = userEvent.setup();
    await openSelectGroupMenu(user);

    // Type in search
    const searchInput = screen.getByPlaceholderText("Search for a property");
    await user.type(searchInput, "Done");

    // "Done" should be visible
    expect(screen.getByRole("option", { name: "Done" })).toBeInTheDocument();

    // "Name" should be filtered out
    expect(
      screen.queryByRole("option", { name: "Name" }),
    ).not.toBeInTheDocument();
  });

  it("should navigate to Edit Group menu after selecting a property", async () => {
    const user = userEvent.setup();
    await openSelectGroupMenu(user);

    // Select a property to group by (use the option)
    const doneOption = screen.getByRole("option", { name: "Done" });
    await user.click(doneOption);

    // Should navigate to Edit Group menu
    expect(screen.getByRole("heading", { name: "Group" })).toBeInTheDocument();

    // Should show the selected property (may appear multiple times)
    expect(screen.getAllByText("Done").length).toBeGreaterThan(0);
  });

  it("should have 'None' option available when no grouping is selected", async () => {
    const user = userEvent.setup();
    await openSelectGroupMenu(user);

    // None option should be present
    const noneOption = screen.getByRole("option", { name: "None" });
    expect(noneOption).toBeInTheDocument();
  });

  it("should navigate back to View Settings when clicking back button (no grouping)", async () => {
    const user = userEvent.setup();
    await openSelectGroupMenu(user);

    // Click back button
    const backButton = screen.getByRole("button", { name: /back/i });
    await user.click(backButton);

    // Should return to main menu with "View Settings" (since no grouping was selected)
    expect(
      screen.getByRole("heading", { name: "View Settings" }),
    ).toBeInTheDocument();
  });
});
