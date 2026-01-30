import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { mockResizeObserver } from "../__tests__/mock";
import type { ColumnInfo, Row } from "../lib/types";
import { TableView } from "../table-contexts";

mockResizeObserver();

// Mock properties with a deleted property
const mockPropertiesWithDeleted: ColumnInfo[] = [
  {
    id: "col1",
    name: "Title",
    type: "text",
    width: "200",
    config: {},
  },
  {
    id: "col2",
    name: "Status",
    type: "checkbox",
    width: "100",
    config: {},
  },
  {
    id: "col3",
    name: "Archived Property",
    type: "text",
    width: "150",
    config: {},
    isDeleted: true,
  },
  {
    id: "col4",
    name: "Old Property",
    type: "checkbox",
    width: "100",
    config: {},
    isDeleted: true,
  },
];

const mockDataWithDeleted: Row[] = [
  {
    id: "row1",
    createdAt: Date.now(),
    lastEditedAt: Date.now(),
    properties: {
      col1: { id: "cell1", value: "Task 1" },
      col2: { id: "cell2", value: true },
      col3: { id: "cell3", value: "archived" },
      col4: { id: "cell4", value: false },
    },
  },
];

function renderTableView() {
  return render(
    <TableView
      properties={mockPropertiesWithDeleted}
      data={mockDataWithDeleted}
    />,
  );
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

async function openDeletedPropsMenu(user: ReturnType<typeof userEvent.setup>) {
  const menu = await openPropsMenu(user);

  // Click on "Deleted properties" menu item
  const deletedPropsItem = within(menu).getByText("Deleted properties");
  await user.click(deletedPropsItem);

  expect(
    screen.getByRole("heading", { name: "Deleted properties" }),
  ).toBeInTheDocument();

  return menu;
}

describe("DeletedPropsMenu", () => {
  it("should display deleted properties count in Props menu", async () => {
    const user = userEvent.setup();
    renderTableView();

    const menu = await openPropsMenu(user);

    // Should show "Deleted properties" with count badge
    expect(within(menu).getByText("Deleted properties")).toBeInTheDocument();
    // Should show count of 2 deleted properties
    expect(within(menu).getByText("2")).toBeInTheDocument();
  });

  it("should navigate to Deleted Properties menu and show deleted properties", async () => {
    const user = userEvent.setup();
    renderTableView();

    const menu = await openDeletedPropsMenu(user);

    // Should show both deleted properties
    expect(within(menu).getByText("Archived Property")).toBeInTheDocument();
    expect(within(menu).getByText("Old Property")).toBeInTheDocument();
  });

  it("should have restore button for each deleted property", async () => {
    const user = userEvent.setup();
    renderTableView();

    const menu = await openDeletedPropsMenu(user);

    // Should show restore buttons
    const restoreButtons = within(menu).getAllByRole("button", {
      name: /restore/i,
    });
    expect(restoreButtons.length).toBe(2);
  });

  it("should have delete button for each deleted property", async () => {
    const user = userEvent.setup();
    renderTableView();

    const menu = await openDeletedPropsMenu(user);

    // Should show delete buttons
    const deleteButtons = within(menu).getAllByRole("button", {
      name: /delete/i,
    });
    expect(deleteButtons.length).toBe(2);
  });

  it("should restore property when clicking restore button", async () => {
    const user = userEvent.setup();
    renderTableView();

    const menu = await openDeletedPropsMenu(user);

    // Get initial count
    const restoreButtons = within(menu).getAllByRole("button", {
      name: /restore/i,
    });
    expect(restoreButtons.length).toBe(2);

    // Click restore on first property
    await user.click(restoreButtons[0]!);

    // Property should be removed from deleted list
    const remainingRestoreButtons = within(menu).getAllByRole("button", {
      name: /restore/i,
    });
    expect(remainingRestoreButtons.length).toBe(1);
  });

  it("should permanently delete property when clicking delete button", async () => {
    const user = userEvent.setup();
    renderTableView();

    const menu = await openDeletedPropsMenu(user);

    // Get initial count
    const deleteButtons = within(menu).getAllByRole("button", {
      name: /delete/i,
    });
    expect(deleteButtons.length).toBe(2);

    // Click delete on first property ("Archived Property")
    await user.click(deleteButtons[0]!);

    // Property should be removed from list
    expect(
      within(menu).queryByText("Archived Property"),
    ).not.toBeInTheDocument();
  });

  it("should navigate back to Properties menu when clicking back button", async () => {
    const user = userEvent.setup();
    renderTableView();

    const menu = await openDeletedPropsMenu(user);

    // Click back button
    const backButton = within(menu).getByRole("button", { name: /back/i });
    await user.click(backButton);

    // Should return to Properties menu
    expect(
      screen.getByRole("heading", { name: "Properties" }),
    ).toBeInTheDocument();
  });
});
