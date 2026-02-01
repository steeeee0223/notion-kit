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

function renderTableView() {
  return render(<TableView properties={mockProperties} data={mockData} />);
}

async function addSortRule(user: UserEvent, propertyName: string) {
  renderTableView();

  const sortButton = screen.getByRole("button", { name: "Sort" });
  await user.click(sortButton);

  const addSortButton = screen.getByRole("menuitem", { name: "Add sort" });
  await user.click(addSortButton);

  const commandList = screen.getByRole("listbox");
  const propertyOption = within(commandList).getByText(propertyName);
  await user.click(propertyOption);

  // Close the property selection popover by pressing Escape twice
  // (once for nested popover, once for main sort popover)
  await user.keyboard("{Escape}");
  await user.keyboard("{Escape}");
}

describe("SortMenu", () => {
  it("should add a sort rule after searching and selecting a property", async () => {
    const user = userEvent.setup();
    renderTableView();

    // Open sort menu
    const sortButton = screen.getByRole("button", { name: "Sort" });
    await user.click(sortButton);

    // Click "Add sort"
    const addSortButton = screen.getByRole("menuitem", { name: "Add sort" });
    await user.click(addSortButton);

    // Type to search for a property
    const searchInput = screen.getByPlaceholderText("Search for a property...");
    await user.type(searchInput, "Done");

    // Select the "Done" property from the list
    const commandList = screen.getByRole("listbox");
    const doneOption = within(commandList).getByText("Done");
    await user.click(doneOption);

    // Close popovers by pressing Escape
    await user.keyboard("{Escape}");
    await user.keyboard("{Escape}");

    // Verify popovers are closed
    expect(
      screen.queryByPlaceholderText("Search for a property..."),
    ).not.toBeInTheDocument();

    // Re-open sort menu to verify the rule was added
    await user.click(sortButton);
    expect(
      screen.getByRole("menuitem", { name: "Add sort" }),
    ).toBeInTheDocument();

    // Should display the sort rule with "Ascending" direction
    expect(screen.getByText("Ascending")).toBeInTheDocument();
  });

  it("should delete all sort rules when clicking 'Delete sort'", async () => {
    const user = userEvent.setup();
    await addSortRule(user, "Name");

    // Open sort menu and verify rule exists
    const sortButton = screen.getByRole("button", { name: "Sort" });
    await user.click(sortButton);
    expect(
      screen.getByRole("menuitem", { name: "Add sort" }),
    ).toBeInTheDocument();

    expect(screen.getByText("Ascending")).toBeInTheDocument();

    // Click "Delete sort" to remove all rules
    const deleteSortButton = screen.getByRole("menuitem", {
      name: "Delete sort",
    });
    await user.click(deleteSortButton);

    // Click outside to ensure popover is closed
    await user.click(document.body);

    // Re-open sort menu
    await user.click(sortButton);
    expect(
      screen.getByRole("menuitem", { name: "Add sort" }),
    ).toBeInTheDocument();

    // Verify no rules exist (no "Ascending" text)
    expect(screen.queryByText("Ascending")).not.toBeInTheDocument();
  });
});
