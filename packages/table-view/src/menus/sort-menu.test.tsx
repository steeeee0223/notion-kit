import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderTableView } from "../__tests__/component-objects/render-table-view";
import { mockResizeObserver } from "../__tests__/mock";

mockResizeObserver();

describe("SortMenu", () => {
  it("SortMenu_SearchAndSelect_AddsAscendingRule", async () => {
    const tableView = renderTableView();
    const sort = await tableView.openSortMenu();

    await sort.startAdding();
    await sort.search("Done");
    await tableView.user.click(sort.propertyOption("Done"));

    expect(sort.querySearchInput()).not.toBeInTheDocument();
    expect(sort.directionTrigger("Ascending")).toBeVisible();
    expect(sort.moveHandle("Done")).toBeVisible();
  });

  it("SortMenu_DeleteAll_RemovesEveryRule", async () => {
    const tableView = renderTableView();
    const sort = await tableView.openSortMenu();
    await sort.addRule("Name");

    await sort.deleteAll();

    expect(sort.queryDirection("Ascending")).not.toBeInTheDocument();
  });

  it("SortMenu_TypedSearch_RemainsInAddPanel", async () => {
    const tableView = renderTableView();
    const sort = await tableView.openSortMenu();
    await sort.startAdding();

    await sort.search("Done");

    expect(sort.searchInput()).toHaveValue("Done");
    expect(sort.propertyOption("Done")).toBeVisible();
  });

  it("SortMenu_DirectionTrigger_OpensDirectionOptions", async () => {
    const tableView = renderTableView();
    const sort = await tableView.openSortMenu();
    await sort.addRule("Name");

    await sort.openDirection("Ascending");

    expect(sort.directionOption("Descending")).toBeVisible();
  });

  it("SortMenu_DirectionSelection_ChangesExistingRule", async () => {
    const tableView = renderTableView();
    const sort = await tableView.openSortMenu();
    await sort.addRule("Name");

    await sort.openDirection("Ascending");
    await tableView.user.click(sort.directionOption("Descending"));

    expect(sort.directionTrigger("Descending")).toBeVisible();
  });

  it("SortMenu_PropertySelection_ReplacesRuleProperty", async () => {
    const tableView = renderTableView();
    const sort = await tableView.openSortMenu();
    await sort.addRule("Name");

    await tableView.user.click(
      sort.root.querySelector<HTMLElement>(
        '[role="combobox"][aria-label="Name"]',
      )!,
    );
    await tableView.user.click(
      await screen.findByRole("option", { name: "Done" }),
    );

    expect(sort.moveHandle("Done")).toBeVisible();
  });

  it("SortMenu_AddPanel_DisablesAlreadySortedProperties", async () => {
    const tableView = renderTableView();
    const sort = await tableView.openSortMenu();
    await sort.addRule("Name");
    await sort.startAdding();

    expect(sort.propertyOption("Name")).toHaveAttribute(
      "aria-disabled",
      "true",
    );
  });

  it("SortMenu_SearchWithoutMatches_ShowsEmptyState", async () => {
    const tableView = renderTableView();
    const sort = await tableView.openSortMenu();
    await sort.startAdding();

    await sort.search("missing property");

    expect(screen.getByText("No results")).toBeVisible();
  });

  it("SortMenu_RemoveRule_RemovesNamedRule", async () => {
    const tableView = renderTableView();
    const sort = await tableView.openSortMenu();
    await sort.addRule("Name");

    await sort.remove("Name");

    expect(sort.queryDirection("Ascending")).not.toBeInTheDocument();
  });
});
