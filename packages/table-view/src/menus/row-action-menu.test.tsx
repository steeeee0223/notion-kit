/**
 * Row Action Menu Tests
 * Tests for the row action menu functionality
 */

import { describe, expect, it } from "vitest";

import { renderTableView } from "@/__tests__/component-objects/render-table-view";
import { mockResizeObserver } from "@/__tests__/mock";

mockResizeObserver();

async function openRowActionMenu() {
  const tableView = renderTableView({ getRowUrl: (rowId) => `/${rowId}` });
  const menu = await tableView.openRowActions("Task 1");
  expect(menu.root).toBeInTheDocument();
  return menu;
}

describe("RowActionMenu", () => {
  it("RowActionMenu_Open_ShowsSearchInput", async () => {
    const menu = await openRowActionMenu();

    expect(menu.searchInput()).toBeInTheDocument();
  });

  it("RowActionMenu_Open_ShowsEditIconOption", async () => {
    const menu = await openRowActionMenu();

    expect(menu.text("Edit icon")).toBeInTheDocument();
  });

  it("RowActionMenu_Open_ShowsActions", async () => {
    const menu = await openRowActionMenu();

    expect(menu.option(/open in new tab/i)).toBeInTheDocument();
    expect(menu.option(/copy link/i)).toBeInTheDocument();
    expect(menu.option(/duplicate/i)).toBeInTheDocument();
    expect(menu.option(/delete/i)).toBeInTheDocument();
  });

  it("RowActionMenu_Open_ShowsKeyboardShortcuts", async () => {
    const menu = await openRowActionMenu();

    const duplicateItem = menu.option(/duplicate/i);
    expect(duplicateItem).toBeInTheDocument();
    expect(menu.shortcutFor(/duplicate/i, /⌘D/)).toBeInTheDocument();

    const deleteItem = menu.option(/delete/i);
    expect(deleteItem).toBeInTheDocument();
    expect(menu.shortcutFor(/delete/i, /Delete/)).toBeInTheDocument();
  });

  it("RowActionMenu_Search_FiltersActions", async () => {
    const menu = await openRowActionMenu();

    await menu.search("duplicate");

    expect(menu.option(/duplicate/i)).toBeInTheDocument();
    expect(menu.queryOption(/copy link/i)).not.toBeInTheDocument();
  });

  it("RowActionMenu_CopyLink_CopiesRowUrl", async () => {
    const menu = await openRowActionMenu();

    menu.choose(/copy link/i);

    const url = await navigator.clipboard.readText();
    expect(url.endsWith("/row1")).toBeTruthy();
  });

  it("RowActionMenu_Duplicate_DuplicatesRow", async () => {
    const menu = await openRowActionMenu();

    menu.choose(/duplicate/i);

    await menu.waitForRowCount("Task 1", 2);
  });

  it("RowActionMenu_Delete_DeletesRow", async () => {
    const menu = await openRowActionMenu();

    menu.choose(/delete/i);

    await menu.waitForRowRemoved("Task 1");
  });
});
