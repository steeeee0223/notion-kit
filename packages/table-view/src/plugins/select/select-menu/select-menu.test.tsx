import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SelectMenuObject } from "@/__tests__/component-objects/select-menu";
import { mockResizeObserver } from "@/__tests__/mock";

import { renderSelectTable } from "../__tests__/utils";

mockResizeObserver();

describe("SelectMenu - Single Select", () => {
  it("SelectMenu_SingleSelect_SelectsExistingOption", async () => {
    const tableView = renderSelectTable();

    const menu = await SelectMenuObject.open(tableView, "Row 1", "Status");

    expect(menu.combobox()).toBeInTheDocument();
    expect(menu.option("Option A")).toBeInTheDocument();
    await menu.choose("Option A");

    await menu.waitForCellText("Option A");
  });

  it("SelectMenu_SingleSelect_BackspaceClearsSelection", async () => {
    const tableView = renderSelectTable({ preselected: "single" });

    expect(screen.getByText("Option A")).toBeInTheDocument();

    const menu = await SelectMenuObject.open(tableView, "Row 1", "Status");

    expect(menu.combobox()).toBeInTheDocument();
    await menu.clearSelectionWithBackspace();
    await menu.close();

    await menu.waitForCellNotText("Option A");
  });

  it("SelectMenu_Search_CreatesNewOption", async () => {
    const tableView = renderSelectTable();

    const menu = await SelectMenuObject.open(tableView, "Row 1", "Status");

    const newName = "Brand New Option";
    await menu.create(newName);

    expect(menu.option(newName)).toBeInTheDocument();
  });

  it("SelectMenu_Search_FiltersOptions", async () => {
    const tableView = renderSelectTable();

    const menu = await SelectMenuObject.open(tableView, "Row 1", "Status");

    expect(screen.getByText("Option A")).toBeInTheDocument();
    expect(screen.getByText("Option B")).toBeInTheDocument();
    expect(screen.getByText("Option C")).toBeInTheDocument();

    const typed = "nonexistent";
    await menu.search(typed);

    expect(screen.queryByText("Option A")).not.toBeInTheDocument();
    expect(screen.queryByText("Option B")).not.toBeInTheDocument();
    expect(screen.queryByText("Option C")).not.toBeInTheDocument();
    expect(menu.createOption(typed)).toBeInTheDocument();
  });

  it("SelectMenu_SingleSelect_ReplacesPreviousSelection", async () => {
    const tableView = renderSelectTable({ preselected: "single" });

    expect(screen.getByText("Option A")).toBeInTheDocument();

    const menu = await SelectMenuObject.open(tableView, "Row 1", "Status");

    await menu.choose("Option B");

    await menu.waitForCellText("Option B");
    expect(menu.selectedCell()).not.toHaveTextContent("Option A");
  });
});

describe("SelectMenu - Multi Select", () => {
  it("SelectMenu_MultiSelect_AccumulatesSelections", async () => {
    const tableView = renderSelectTable();

    const menu = await SelectMenuObject.open(tableView, "Row 1", "Tags");

    expect(menu.combobox()).toBeInTheDocument();

    await menu.choose("Option A");
    await menu.choose("Option B");

    expect(menu.combobox().parentElement).toHaveTextContent("Option A");
    expect(menu.combobox().parentElement).toHaveTextContent("Option B");
  });
});

describe("SelectMenu - Option Management", () => {
  it("SelectMenu_OptionActions_OpensMenu", async () => {
    const tableView = renderSelectTable();

    const menu = await SelectMenuObject.open(tableView, "Row 1", "Status");

    expect(menu.option("Option A")).toBeInTheDocument();
    await menu.openOptionActions("Option A");

    expect(
      screen.getByRole("menuitem", { name: /delete/i }),
    ).toBeInTheDocument();
  });

  it("SelectMenu_OptionActions_DeletesOption", async () => {
    const tableView = renderSelectTable();

    const menu = await SelectMenuObject.open(tableView, "Row 1", "Status");

    await menu.deleteOption("Option A");

    expect(menu.queryOption("Option A")).not.toBeInTheDocument();
  });
});
