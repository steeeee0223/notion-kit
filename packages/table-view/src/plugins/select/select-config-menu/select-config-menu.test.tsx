import { describe, expect, it, vi } from "vitest";

import { SelectConfigMenuObject } from "@/__tests__/component-objects/select-config-menu";
import { mockResizeObserver } from "@/__tests__/mock";

import { renderSelectConfigMenuTable } from "../__tests__/utils";

mockResizeObserver();

const optionNames = ["Option A", "Option B", "Option C"];

async function openSelectConfigMenu() {
  const tableView = renderSelectConfigMenuTable({ preselected: "single" });
  return SelectConfigMenuObject.find(tableView.user);
}

describe("SelectConfigMenu", () => {
  it("SelectConfigMenu_Open_ShowsOptionsWithDragHandles", async () => {
    const menu = await openSelectConfigMenu();

    expect(menu.label("Options")).toBeInTheDocument();
    expect(menu.sortableList()).toBeInTheDocument();
    expect(menu.moveHandle("Option A")).toBeInTheDocument();
  });

  it("SelectConfigMenu_AddOption_AppendsOption", async () => {
    const menu = await openSelectConfigMenu();

    await menu.addOption("New Status");
    expect(menu.option("New Status")).toBeInTheDocument();
    expect(menu.optionNames([...optionNames, "New Status"])).toEqual([
      "Option A",
      "Option B",
      "Option C",
      "New Status",
    ]);
  });

  it("SelectConfigMenu_DuplicateOption_ShowsValidationError", async () => {
    const menu = await openSelectConfigMenu();

    await menu.tryAddOption("Option A");
    expect(menu.duplicateError()).toBeInTheDocument();
    expect(menu.addInput()).toHaveAttribute("aria-invalid", "true");
  });

  it("SelectConfigMenu_OpenOption_ShowsOptionEditor", async () => {
    const menu = await openSelectConfigMenu();

    const optionMenu = await menu.openOptionMenu("Option A");
    expect(optionMenu.nameInput()).toHaveValue("Option A");
    expect(optionMenu.colorsLabel()).toBeInTheDocument();
  });

  it("SelectConfigMenu_RenameOption_UpdatesOptionName", async () => {
    const menu = await openSelectConfigMenu();
    const optionMenu = await menu.openOptionMenu("Option A");

    await optionMenu.rename("Renamed Option");
    expect(menu.option("Renamed Option")).toBeInTheDocument();
    expect(menu.queryOption("Option A")).not.toBeInTheDocument();
  });

  it("SelectConfigMenu_RenameOption_ReportsOnlyChangedRows", async () => {
    const onDataChange = vi.fn();
    const tableView = renderSelectConfigMenuTable({
      preselected: "single",
      onDataChange,
    });
    const menu = await SelectConfigMenuObject.find(tableView.user);
    const optionMenu = await menu.openOptionMenu("Option A");

    await optionMenu.rename("Renamed Option");

    expect(onDataChange.mock.lastCall?.[0]).toMatchObject({
      action: {
        type: "data.cell.update",
        payload: { rowIds: ["row-1"] },
      },
    });
  });

  it("SelectConfigMenu_ChooseOptionColor_ChecksSelectedColor", async () => {
    const menu = await openSelectConfigMenu();
    const optionMenu = await menu.openOptionMenu("Option A");

    await optionMenu.chooseColor("Red");
    expect(optionMenu.color("Red")).toHaveAttribute("aria-checked", "true");
  });

  it("SelectConfigMenu_DeleteOption_RemovesOption", async () => {
    const menu = await openSelectConfigMenu();

    await menu.deleteOption("Option A");
    expect(menu.queryOption("Option A")).not.toBeInTheDocument();
  });

  it("SelectConfigMenu_OpenSortMenu_ShowsSortChoices", async () => {
    const menu = await openSelectConfigMenu();

    const sortMenu = await menu.openSortMenu();
    expect(sortMenu.item("Manual")).toBeVisible();
    expect(sortMenu.item("Alphabetical")).toBeVisible();
    expect(sortMenu.item("Reverse alphabetical")).toBeVisible();
  });

  it("SelectConfigMenu_ChangeSort_ReordersOptions", async () => {
    const menu = await openSelectConfigMenu();
    let sortMenu = await menu.openSortMenu();

    sortMenu.choose("Reverse alphabetical");
    expect(menu.optionNames(optionNames)).toEqual([
      "Option C",
      "Option B",
      "Option A",
    ]);

    sortMenu = await menu.openSortMenu();
    sortMenu.choose("Alphabetical");
    expect(menu.optionNames(optionNames)).toEqual([
      "Option A",
      "Option B",
      "Option C",
    ]);
  });
});
