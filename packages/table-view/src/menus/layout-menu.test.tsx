import { render, screen, waitFor } from "@testing-library/react";
import userEvent, { PointerEventsCheckLevel } from "@testing-library/user-event";
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

function setupSubmenuUser() {
  return userEvent.setup({
    pointerEventsCheck: PointerEventsCheckLevel.Never,
  });
}

async function openLayoutMenu(user: ReturnType<typeof userEvent.setup>) {
  const settingsButton = screen.getByRole("button", { name: "Settings" });
  await user.click(settingsButton);

  expect(
    screen.getByRole("heading", { name: "View Settings" }),
  ).toBeInTheDocument();

  // Click Layout menu item
  const layoutMenuItem = screen.getByRole("menuitem", { name: /layout/i });
  await user.click(layoutMenuItem);

  expect(screen.getByRole("heading", { name: "Layout" })).toBeInTheDocument();
}

/**
 * Helper to find a layout button by its text content
 */
function getLayoutButton(name: string): HTMLElement {
  const button = screen.queryByRole("button", { name });
  if (!button) {
    throw new Error(`Layout button with name "${name}" not found`);
  }
  return button;
}

describe("LayoutMenu", () => {
  it("should display the Layout menu with layout options", async () => {
    const user = userEvent.setup();
    renderTableView();

    await openLayoutMenu(user);

    // Should show layout options
    expect(screen.getByRole("button", { name: "Table" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Board" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "List" })).toBeInTheDocument();
  });

  it("should show Table as the default selected layout", async () => {
    const user = userEvent.setup();
    renderTableView();

    await openLayoutMenu(user);

    // Table button should be selected
    const tableButton = getLayoutButton("Table");
    expect(tableButton.ariaSelected).toBe("true");
  });

  it("should switch to List layout when clicking List", async () => {
    const user = userEvent.setup();
    renderTableView();

    await openLayoutMenu(user);

    // Click List button
    const listButton = getLayoutButton("List");
    await user.click(listButton);

    // List button should now be selected
    expect(listButton.ariaSelected).toBe("true");

    // Table button should not be selected
    const tableButton = getLayoutButton("Table");
    expect(tableButton.ariaSelected).toBe("false");
  });

  it("should switch to Board layout when clicking Board", async () => {
    const user = userEvent.setup();
    renderTableView();

    await openLayoutMenu(user);

    // Click Board button
    const boardButton = getLayoutButton("Board");
    await user.click(boardButton);

    // Board button should now be selected
    expect(boardButton.ariaSelected).toBe("true");
  });

  it("should show 'Open pages in' as a row view submenu", async () => {
    const user = setupSubmenuUser();
    renderTableView();

    await openLayoutMenu(user);

    const rowViewTrigger = screen.getByRole("menuitem", {
      name: /Open pages in/i,
    });
    expect(rowViewTrigger).toHaveTextContent("Side peek");
    expect(
      screen.queryByRole("menuitemcheckbox", { name: /Side peek/i }),
    ).not.toBeInTheDocument();

    await user.hover(rowViewTrigger);

    expect(
      await screen.findByRole("menuitemcheckbox", { name: /Side peek/i }),
    ).toBeChecked();
  });

  it("should change row view from the submenu without closing the layout menu", async () => {
    const user = setupSubmenuUser();
    renderTableView();

    await openLayoutMenu(user);

    await user.hover(screen.getByRole("menuitem", { name: /Open pages in/i }));
    const centerPeek = await screen.findByRole("menuitemcheckbox", {
      name: /Center peek/i,
    });
    await user.click(centerPeek);

    expect(
      screen.getByRole("heading", { name: "Layout" }),
    ).toBeInTheDocument();
    await waitFor(() => expect(centerPeek).toBeChecked());
  });

  it("should navigate back to View Settings when clicking back button", async () => {
    const user = userEvent.setup();
    renderTableView();

    await openLayoutMenu(user);

    // Click back button
    const backButton = screen.getByRole("button", { name: /back/i });
    await user.click(backButton);

    // Should return to main menu with "View Settings"
    expect(
      screen.getByRole("heading", { name: "View Settings" }),
    ).toBeInTheDocument();
  });
});
