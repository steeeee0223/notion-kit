import { waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { FilterMenuObject } from "@/__tests__/component-objects/filter-menu";

describe.each(["dropdown", "context"] as const)("FilteredMenu %s", (kind) => {
  it("FilteredMenu_Search_HidesEmptyGroupsAndTheirLabels", async () => {
    const menu = await FilterMenuObject.open(kind, vi.fn());
    expect(menu.queryGroup("Pages")).toBeVisible();
    expect(menu.queryGroup("Actions")).toBeVisible();

    await menu.search("Archive");
    expect(menu.queryGroup("Pages")).toBeVisible();
    expect(menu.queryLabel("Pages")).toBeVisible();
    expect(menu.queryGroup("Actions")).not.toBeInTheDocument();
    expect(menu.queryLabel("Actions")).not.toBeVisible();

    await menu.clear();
    expect(menu.queryGroup("Actions")).toBeVisible();
    expect(menu.queryLabel("Actions")).toBeVisible();
  });
  it("FilteredMenu_SearchAndClear_PreservesNativeRolesAndRestoresActions", async () => {
    const menu = await FilterMenuObject.open(kind, vi.fn());
    expect(menu.input()).toHaveAttribute("aria-controls", menu.list().id);
    expect(menu.item("Unavailable")).toHaveAttribute("aria-disabled", "true");

    await menu.search("no matches");
    expect(menu.queryItem("Archive")).not.toBeInTheDocument();
    expect(menu.empty()).toHaveTextContent("No results");

    await menu.clear();
    expect(menu.input()).toHaveValue("");
    expect(menu.item("Archive")).toBeVisible();
    expect(menu.item("Duplicate")).toBeVisible();
    expect(menu.input()).toHaveFocus();
  });

  it("FilteredMenu_KeyboardActivation_InvokesActionOnce", async () => {
    const onSelect = vi.fn();
    const menu = await FilterMenuObject.open(kind, onSelect);
    await menu.search("Archive");
    await menu.user.keyboard("{ArrowDown}{Enter}");
    expect(onSelect).toHaveBeenCalledOnce();
    await waitFor(() => expect(menu.root).not.toBeInTheDocument());
  });

  it("FilteredMenu_Escape_RestoresTriggerFocus", async () => {
    const menu = await FilterMenuObject.open(kind, vi.fn());
    await menu.search("Archive");
    await menu.user.keyboard("{Escape}");
    await waitFor(() => expect(menu.root).not.toBeInTheDocument());
    expect(menu.trigger).toHaveFocus();
  });
});
