/**
 * Row Action Menu Tests
 * Tests for the row action menu functionality
 */

import { render, screen, within } from "@testing-library/react";
import userEvent, { UserEvent } from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import {
  mockData,
  mockProperties,
  mockResizeObserver,
} from "../__tests__/mock";
import { TableView } from "../table-contexts";

mockResizeObserver();

async function openRowActionMenu(user: UserEvent) {
  render(
    <TableView
      properties={mockProperties}
      data={mockData}
      getRowUrl={(rowId) => `/${rowId}`}
    />,
  );

  const row1 = screen.getByRole("row", { name: "Task 1" });
  const menuTrigger = within(row1).getByRole("button", {
    name: "Row actions",
  });
  await user.click(menuTrigger);

  const menu = screen.getByRole("dialog");
  expect(menu).toBeInTheDocument();
  return menu;
}

describe("RowActionMenu", () => {
  it("should display search input", async () => {
    const user = userEvent.setup();
    const menu = await openRowActionMenu(user);

    expect(
      within(menu).getByPlaceholderText("Search actions..."),
    ).toBeInTheDocument();
  });

  it("should show 'Edit icon' option", async () => {
    const user = userEvent.setup();
    const menu = await openRowActionMenu(user);

    expect(within(menu).getByText("Edit icon")).toBeInTheDocument();
  });

  it("should display options", async () => {
    const user = userEvent.setup();
    const menu = await openRowActionMenu(user);

    expect(
      within(menu).getByRole("option", { name: /open in new tab/i }),
    ).toBeInTheDocument();
    expect(
      within(menu).getByRole("option", { name: /copy link/i }),
    ).toBeInTheDocument();
    expect(
      within(menu).getByRole("option", { name: /duplicate/i }),
    ).toBeInTheDocument();
    expect(
      within(menu).getByRole("option", { name: /delete/i }),
    ).toBeInTheDocument();
  });

  it("should show keyboard shortcuts for actions", async () => {
    const user = userEvent.setup();
    const menu = await openRowActionMenu(user);

    // Check for duplicate keyboard shortcut
    const duplicateItem = within(menu).getByRole("option", {
      name: /duplicate/i,
    });
    expect(duplicateItem).toBeInTheDocument();
    expect(within(duplicateItem).getByText(/⌘D/)).toBeInTheDocument();

    // Check for delete keyboard shortcut
    const deleteItem = within(menu).getByRole("option", { name: /delete/i });
    expect(deleteItem).toBeInTheDocument();
    expect(within(deleteItem).getByText(/Delete/)).toBeInTheDocument();
  });

  it("should filter actions when searching", async () => {
    const user = userEvent.setup();
    const menu = await openRowActionMenu(user);

    const searchInput = within(menu).getByPlaceholderText("Search actions...");
    await user.type(searchInput, "duplicate");

    // Should show Duplicate option
    expect(
      within(menu).getByRole("option", { name: /duplicate/i }),
    ).toBeInTheDocument();

    // Should not show Copy link
    expect(
      within(menu).queryByRole("option", { name: /copy link/i }),
    ).not.toBeInTheDocument();
  });

  it("should copy correct link when clicking 'Copy link'", async () => {
    const user = userEvent.setup();
    const menu = await openRowActionMenu(user);

    const copyLinkOption = within(menu).getByRole("option", {
      name: /copy link/i,
    });
    await user.click(copyLinkOption);

    const url = await navigator.clipboard.readText();
    expect(url.endsWith("/row1")).toBeTruthy();
  });

  it("should duplicate row when clicking 'Duplicate'", async () => {
    const user = userEvent.setup();
    const menu = await openRowActionMenu(user);

    const duplicateOption = within(menu).getByRole("option", {
      name: /duplicate/i,
    });
    await user.click(duplicateOption);

    const rows = screen.getAllByRole("row", { name: "Task 1" });
    expect(rows).toHaveLength(2);
  });

  it("should delete row when clicking 'Delete'", async () => {
    const user = userEvent.setup();
    const menu = await openRowActionMenu(user);

    const deleteOption = within(menu).getByRole("option", { name: /delete/i });
    await user.click(deleteOption);

    const row1 = screen.queryByRole("row", { name: "Task 1" });
    expect(row1).not.toBeInTheDocument();
  });
});
