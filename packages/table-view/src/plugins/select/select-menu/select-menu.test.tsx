import { screen, within } from "@testing-library/react";
import userEvent, { UserEvent } from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { renderSelectTable } from "../__tests__/utils";
import { mockResizeObserver } from "../../../__tests__/mock";

mockResizeObserver();

async function clickSelectCell(
  user: UserEvent,
  colIndex: number,
  rowIndex = 0,
) {
  // Data rows have role="row" — header is the first row
  const rows = screen.getAllByRole("row");
  const dataRow = rows[rowIndex + 1]!;
  // CellTrigger renders as div[role="button"], not <button>
  const divButtons = dataRow.querySelectorAll('div[role="button"]');
  const cell = divButtons[colIndex] as HTMLElement;
  await user.click(cell);
  return cell;
}

describe("SelectMenu - Single Select", () => {
  it("Flow 1: should select an existing option", async () => {
    const user = userEvent.setup();
    renderSelectTable();

    // Click the single-select cell (index 1, after title at index 0)
    await clickSelectCell(user, 1);

    // Popover should open with combobox input and options
    const combobox = screen.getByRole("combobox");
    expect(combobox).toBeInTheDocument();

    // Click the menuitem that contains "Option A"
    const optionA = screen.getByRole("menuitem", { name: "Option A" });
    expect(optionA).toBeInTheDocument();
    await user.click(optionA);

    // Close popover
    await user.keyboard("{Escape}");

    // Cell should show the selected tag
    const rows = screen.getAllByRole("row");
    const dataRow = rows[1]!;
    const divButtons = dataRow.querySelectorAll('div[role="button"]');
    expect(divButtons[1]!.textContent).toContain("Option A");
  });

  it("Flow 2: should deselect an option by removing the tag", async () => {
    const user = userEvent.setup();
    renderSelectTable({ preselected: "single" });

    // The cell should initially show "Option A"
    expect(screen.getByText("Option A")).toBeInTheDocument();

    // Click the select cell with "Option A"
    await clickSelectCell(user, 1);

    // Popover should open with the tag in the input
    const combobox = screen.getByRole("combobox");
    expect(combobox).toBeInTheDocument();

    // Remove the tag via backspace
    await user.click(combobox);
    await user.keyboard("{Backspace}");

    // Close the popover
    await user.keyboard("{Escape}");

    // Cell should no longer contain the tag
    const rows = screen.getAllByRole("row");
    const dataRow = rows[1]!;
    const divButtons = dataRow.querySelectorAll('div[role="button"]');
    expect(divButtons[1]!.textContent).not.toContain("Option A");
  });

  it("Flow 3: should create a new option via search input", async () => {
    const user = userEvent.setup();
    renderSelectTable();

    // Click the single-select cell
    await clickSelectCell(user, 1);

    // Type a new option name
    const newName = "Brand New Option";
    const combobox = screen.getByRole("combobox");
    await user.type(combobox, newName);

    // "Create" suggestion should appear with the option name
    const createItem = screen.getByRole("menuitem", {
      name: `Create ${newName}`,
    });
    expect(createItem).toBeDefined();

    // Click the create suggestion
    await user.click(createItem);

    // The new tag should be selected (may appear multiple times: in tag input + in list)
    const newOptionElements = screen.getByRole("menuitem", { name: newName });
    expect(newOptionElements).toBeInTheDocument();
  });

  it("Flow 4: should filter options when searching", async () => {
    const user = userEvent.setup();
    renderSelectTable();

    // Click the single-select cell
    await clickSelectCell(user, 1);

    // Should show all options initially
    expect(screen.getByText("Option A")).toBeInTheDocument();
    expect(screen.getByText("Option B")).toBeInTheDocument();
    expect(screen.getByText("Option C")).toBeInTheDocument();

    // Type something in the combobox. Note: useFilter lowercases the search
    // so typing a non-matching string hides all existing options and shows
    // a "Create" suggestion instead.
    const typed = "nonexistent";
    const combobox = screen.getByRole("combobox");
    await user.type(combobox, typed);

    // All existing options should be filtered out — no options match
    expect(screen.queryByText("Option A")).not.toBeInTheDocument();
    expect(screen.queryByText("Option B")).not.toBeInTheDocument();
    expect(screen.queryByText("Option C")).not.toBeInTheDocument();

    // "Create" suggestion should appear for the typed text
    const createItem = screen.getByRole("menuitem", {
      name: `Create ${typed}`,
    });
    expect(createItem).toBeInTheDocument();
  });

  it("Flow 5: single select should replace previous selection", async () => {
    const user = userEvent.setup();
    renderSelectTable({ preselected: "single" });

    // Cell shows "Option A" initially
    expect(screen.getByText("Option A")).toBeInTheDocument();

    // Click the cell to open popover
    await clickSelectCell(user, 1);

    // Select Option B
    const optionB = screen.getByRole("menuitem", { name: "Option B" });
    await user.click(optionB);

    // Close popover
    await user.keyboard("{Escape}");

    // Cell should show Option B, not Option A
    const rows = screen.getAllByRole("row");
    const dataRow = rows[1]!;
    const divButtons = dataRow.querySelectorAll('div[role="button"]');
    const cellText = divButtons[1]!.textContent;
    expect(cellText).toContain("Option B");
    expect(cellText).not.toContain("Option A");
  });
});

describe("SelectMenu - Multi Select", () => {
  it("Flow 6: multi select should accumulate selections", async () => {
    const user = userEvent.setup();
    renderSelectTable();

    // Click the multi-select cell (index 2)
    await clickSelectCell(user, 2);

    // Popover should open
    expect(screen.getByRole("combobox")).toBeInTheDocument();

    // Select Option A
    const optionA = screen.getByRole("menuitem", { name: "Option A" });
    await user.click(optionA);

    // Select Option B
    const optionB = screen.getByRole("menuitem", { name: "Option B" });
    await user.click(optionB);

    // Both tags should be present in the combobox area
    const combobox = screen.getByRole("combobox");
    const inputArea = combobox.closest("[data-radix-popper-content-wrapper]");
    if (inputArea) {
      expect(inputArea.textContent).toContain("Option A");
      expect(inputArea.textContent).toContain("Option B");
    }
  });
});

describe("SelectMenu - Option Management", () => {
  it("Flow 7: should open option edit menu via dots button", async () => {
    const user = userEvent.setup();
    renderSelectTable();

    // Click a select cell to open popover
    await clickSelectCell(user, 1);

    // Find the option item containing "Option A"
    const optionA = screen.getByRole("menuitem", { name: "Option A" });
    expect(optionA).toBeInTheDocument();

    // Hover to reveal the dots action button
    await user.hover(optionA);

    // Find the dots button inside the option item.
    const dotsButton = within(optionA).getByRole("button", {
      name: /more/i,
    });
    await user.click(dotsButton);
    expect(
      screen.getByRole("menuitem", { name: /delete/i }),
    ).toBeInTheDocument();
  });

  it("Flow 7b: should delete an option from the edit menu", async () => {
    const user = userEvent.setup();
    renderSelectTable();

    // Click a select cell to open popover
    await clickSelectCell(user, 1);

    // Find and hover over the option
    const optionA = screen.getByRole("menuitem", { name: "Option A" });
    await user.hover(optionA);

    // Find <button> elements inside the option item
    const dotsButton = within(optionA).getByRole("button", {
      name: /more/i,
    });
    await user.click(dotsButton);

    // Click Delete
    const deleteItem = screen.getByRole("menuitem", { name: /delete/i });
    await user.click(deleteItem);

    // Option A should no longer be in the options list
    expect(
      screen.queryByRole("menuitem", { name: "Option A" }),
    ).not.toBeInTheDocument();
  });
});
