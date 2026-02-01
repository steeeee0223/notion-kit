import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { mockResizeObserver } from "../__tests__/mock";
import { openSettingsMenu } from "../__tests__/utils";

mockResizeObserver();

async function openEditGroupMenu(user: ReturnType<typeof userEvent.setup>) {
  await openSettingsMenu(user);

  // Click Group menu item
  const groupMenuItem = screen.getByRole("menuitem", { name: /group/i });
  await user.click(groupMenuItem);

  expect(screen.getByRole("heading", { name: "Group by" })).toBeInTheDocument();

  // Select a property to group by (Done) - use role="option" for CommandItem
  const doneOption = screen.getByRole("option", { name: "Done" });
  await user.click(doneOption);

  expect(screen.getByRole("heading", { name: "Group" })).toBeInTheDocument();
}

describe("EditGroupMenu", () => {
  it("should display the Edit Group menu with selected property", async () => {
    const user = userEvent.setup();
    await openEditGroupMenu(user);

    // Should show "Group" header
    expect(screen.getByRole("heading", { name: "Group" })).toBeInTheDocument();

    // Should show "Group by" with selected property
    expect(
      screen.getByRole("menuitem", { name: /group by/i }),
    ).toBeInTheDocument();
    // "Done" may appear in multiple places
    expect(screen.getAllByText("Done").length).toBeGreaterThan(0);
  });

  it("should show 'Hide empty groups' switch", async () => {
    const user = userEvent.setup();
    await openEditGroupMenu(user);

    // Should show "Hide empty groups" switch
    expect(screen.getByText("Hide empty groups")).toBeInTheDocument();

    // Should have a switch element
    const switchElement = screen.getByRole("switch");
    expect(switchElement).toBeInTheDocument();
  });

  it("should toggle 'Hide empty groups' when clicking the switch", async () => {
    const user = userEvent.setup();
    await openEditGroupMenu(user);

    // Get the switch
    const switchElement = screen.getByRole("switch");
    const initialState = switchElement.getAttribute("aria-checked");

    // Click the switch to toggle
    await user.click(switchElement);

    // Switch should now have the opposite state
    const newState = switchElement.getAttribute("aria-checked");
    expect(newState).not.toBe(initialState);
  });

  it("should show 'Groups' section header with visibility toggle", async () => {
    const user = userEvent.setup();
    await openEditGroupMenu(user);

    // Should show "Groups" header
    expect(screen.getByText("Groups")).toBeInTheDocument();

    // Should show "Hide all" or "Show all" action
    const hideAllButton = screen.queryByRole("button", { name: "Hide all" });
    const showAllButton = screen.queryByRole("button", { name: "Show all" });
    expect(hideAllButton ?? showAllButton).toBeInTheDocument();
  });

  it("should show 'Remove grouping' option", async () => {
    const user = userEvent.setup();
    await openEditGroupMenu(user);

    // Should show "Remove grouping" menu item
    expect(
      screen.getByRole("menuitem", { name: "Remove grouping" }),
    ).toBeInTheDocument();
  });

  it("should remove grouping when clicking 'Remove grouping'", async () => {
    const user = userEvent.setup();
    await openEditGroupMenu(user);

    // Click "Remove grouping"
    const removeGroupingItem = screen.getByRole("menuitem", {
      name: "Remove grouping",
    });
    await user.click(removeGroupingItem);

    // Settings menu should close - reopen settings to verify
    await user.click(document.body);
    const settingsButton = screen.getByRole("button", { name: "Settings" });
    await user.click(settingsButton);

    // Wait for settings menu to open
    expect(
      screen.getByRole("heading", { name: "View Settings" }),
    ).toBeInTheDocument();

    // Group menu item should show no selection (empty text)
    const groupMenuItem = screen.getByRole("menuitem", { name: /group/i });
    // The groupMenuItem should not show "Done" anymore
    expect(within(groupMenuItem).queryByText("Done")).not.toBeInTheDocument();
  });

  it("should show 'Learn about grouping' option", async () => {
    const user = userEvent.setup();
    await openEditGroupMenu(user);

    // Should show "Learn about grouping" menu item
    expect(
      screen.getByRole("menuitem", { name: "Learn about grouping" }),
    ).toBeInTheDocument();
  });

  it("should navigate to Select Group menu when clicking 'Group by'", async () => {
    const user = userEvent.setup();
    await openEditGroupMenu(user);

    // Click "Group by" to change grouping property
    const groupByItem = screen.getByRole("menuitem", { name: /group by/i });
    await user.click(groupByItem);

    // Should navigate to Select Group menu
    expect(
      screen.getByRole("heading", { name: "Group by" }),
    ).toBeInTheDocument();
  });

  it("should navigate back to View Settings when clicking back button", async () => {
    const user = userEvent.setup();
    await openEditGroupMenu(user);

    // Click back button
    const backButton = screen.getByRole("button", { name: /back/i });
    await user.click(backButton);

    // Should return to main menu with "View Settings"
    expect(
      screen.getByRole("heading", { name: "View Settings" }),
    ).toBeInTheDocument();
  });
});
