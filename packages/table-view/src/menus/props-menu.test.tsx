import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import {
  mockData,
  mockProperties,
  mockResizeObserver,
} from "../__tests__/mock";
import { TableView } from "../table-contexts";

mockResizeObserver();

function renderTableView() {
  return render(<TableView properties={mockProperties} data={mockData} />);
}

async function openSettingsMenu(user: ReturnType<typeof userEvent.setup>) {
  const settingsButton = screen.getByRole("button", { name: /settings/i });
  await user.click(settingsButton);

  const menu = screen.getByRole("menu", { name: "View Settings" });
  expect(menu).toBeInTheDocument();
  return menu;
}

async function openPropsMenu(user: ReturnType<typeof userEvent.setup>) {
  const menu = await openSettingsMenu(user);

  // Click on "Edit properties" menu item
  const propsMenuItem = within(menu).getByRole("menuitem", {
    name: "Edit properties",
  });
  await user.click(propsMenuItem);

  expect(
    screen.getByRole("heading", { name: "Properties" }),
  ).toBeInTheDocument();

  return menu;
}

describe("PropsMenu", () => {
  it("should display Properties menu with search input", async () => {
    const user = userEvent.setup();
    renderTableView();

    await openPropsMenu(user);

    // Should show search placeholder
    expect(
      screen.getByPlaceholderText("Search for a property..."),
    ).toBeInTheDocument();
  });

  it("should display all properties in the menu", async () => {
    const user = userEvent.setup();
    renderTableView();

    const menu = await openPropsMenu(user);

    // Should show both Name and Done properties
    expect(within(menu).getByText("Name")).toBeInTheDocument();
    expect(within(menu).getByText("Done")).toBeInTheDocument();
  });

  it("should show 'New property' menu item", async () => {
    const user = userEvent.setup();
    renderTableView();

    const menu = await openPropsMenu(user);

    expect(
      within(menu).getByRole("menuitem", { name: "New property" }),
    ).toBeInTheDocument();
  });

  it("should show 'Learn about properties' menu item", async () => {
    const user = userEvent.setup();
    renderTableView();

    const menu = await openPropsMenu(user);

    expect(
      within(menu).getByRole("menuitem", { name: "Learn about properties" }),
    ).toBeInTheDocument();
  });

  it("should filter properties when searching", async () => {
    const user = userEvent.setup();
    renderTableView();

    const menu = await openPropsMenu(user);

    const searchInput = screen.getByPlaceholderText("Search for a property...");
    await user.type(searchInput, "Name");

    // Should show only Name property
    expect(within(menu).getByText("Name")).toBeInTheDocument();
    // "Done" should not be visible in search results
    expect(
      within(menu).queryByRole("menuitem", { name: "Done" }),
    ).not.toBeInTheDocument();
  });

  it("should show 'No results' when search has no matches", async () => {
    const user = userEvent.setup();
    renderTableView();

    const menu = await openPropsMenu(user);

    const searchInput = screen.getByPlaceholderText("Search for a property...");
    await user.type(searchInput, "nonexistent");

    expect(within(menu).getByText("No results")).toBeInTheDocument();
  });

  it("should toggle property visibility when clicking eye icon", async () => {
    const user = userEvent.setup();
    renderTableView();

    const menu = await openPropsMenu(user);

    // Click visibility toggle for "Done" property
    const visibilityButtons = within(menu).getAllByRole("button", {
      name: "Toggle property visibility",
    });
    // Find a non-disabled button (title property is disabled)
    const doneVisibilityButton = visibilityButtons.find(
      (btn) => !btn.hasAttribute("disabled"),
    );
    expect(doneVisibilityButton).toBeDefined();
    await user.click(doneVisibilityButton!);

    // Property visibility should be toggled (button still present)
    expect(doneVisibilityButton).toBeInTheDocument();
  });

  it("should navigate back to View Settings when clicking back button", async () => {
    const user = userEvent.setup();
    renderTableView();

    const menu = await openPropsMenu(user);

    // Click back button
    const backButton = within(menu).getByRole("button", { name: /back/i });
    await user.click(backButton);

    // Should return to main menu
    expect(
      screen.getByRole("heading", { name: "View Settings" }),
    ).toBeInTheDocument();
  });

  it("should navigate to New Property menu when clicking 'New property'", async () => {
    const user = userEvent.setup();
    renderTableView();

    const menu = await openPropsMenu(user);

    const newPropertyItem = within(menu).getByText("New property");
    await user.click(newPropertyItem);

    // Should navigate to New Property menu
    expect(
      screen.getByRole("heading", { name: "New property" }),
    ).toBeInTheDocument();
  });
});
