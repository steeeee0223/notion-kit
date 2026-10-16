import { screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { MenuSurfaceObject } from "@/__tests__/component-objects/menu-surface";
import { renderTableView } from "@/__tests__/component-objects/render-table-view";
import { mockResizeObserver } from "@/__tests__/mock";

mockResizeObserver();

afterEach(() => {
  vi.restoreAllMocks();
});

async function openPropertiesMenu() {
  const tableView = renderTableView();
  const settings = await tableView.openViewSettings();
  return { tableView, properties: await settings.openProperties() };
}

describe("PropsMenu", () => {
  it("PropertiesMenu_HelpAction_OpensDocumentedHelpTarget", async () => {
    const open = vi.spyOn(window, "open").mockImplementation(() => null);
    const { tableView, properties } = await openPropertiesMenu();

    await tableView.user.click(properties.helpItem());

    expect(open).toHaveBeenCalledWith(
      "https://www.notion.com/help/database-properties",
    );
  });

  it("PropertiesMenu_Search_FiltersProperties", async () => {
    const { properties } = await openPropertiesMenu();

    await properties.search("Name");

    expect(properties.property("Name")).toBeVisible();
    expect(properties.queryProperty("Done")).not.toBeInTheDocument();
  });

  it("PropertiesMenu_Search_KeepsPropertyClickable", async () => {
    const { tableView, properties } = await openPropertiesMenu();

    await properties.search("Done");
    expect(properties.property("Done")).not.toHaveAttribute(
      "aria-disabled",
      "true",
    );
    await tableView.user.click(properties.property("Done"));

    const edit = await MenuSurfaceObject.findByHeading(
      tableView.user,
      "Edit property",
    );
    expect(edit.heading("Edit property")).toBeVisible();
  });

  it("PropertiesMenu_UnmatchedSearch_ShowsNoResults", async () => {
    const { properties } = await openPropertiesMenu();

    await properties.search("nonexistent");

    expect(properties.noResults()).toBeVisible();
    expect(properties.queryGroupHeader()).not.toBeInTheDocument();
    expect(properties.newPropertyItem()).toBeVisible();
    expect(properties.helpItem()).toBeVisible();
  });

  it("PropertiesMenu_ClearSearch_RestoresPropertiesWithoutClosing", async () => {
    const { properties } = await openPropertiesMenu();
    await properties.search("Name");
    expect(properties.queryProperty("Done")).not.toBeInTheDocument();
    await properties.clearSearch();
    expect(properties.searchInput()).toHaveValue("");
    expect(properties.property("Done")).toBeVisible();
    expect(properties.heading()).toBeVisible();
  });

  it("PropertiesMenu_NavigateBetweenSearchPages_ResetsQueryAndKeepsHostOpen", async () => {
    const { properties } = await openPropertiesMenu();
    await properties.search("Name");
    const types = await properties.openNewProperty();
    expect(types.searchInput()).toHaveValue("");
    const next = await types.backToProperties();
    expect(next.searchInput()).toHaveValue("");
    expect(next.property("Done")).toBeVisible();
    const settings = await next.backToViewSettings();
    expect(settings.heading("View Settings")).toBeVisible();
  });

  it("PropertiesMenu_VisibilityToggle_HidesNamedColumnAndUpdatesVisibilityState", async () => {
    const { tableView, properties } = await openPropertiesMenu();
    const doneVisibilityButton = properties.visibilityButton("Done");

    await tableView.user.click(doneVisibilityButton);

    expect(properties.visibilityButton("Done")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Done" }),
    ).not.toBeInTheDocument();
  });

  it("PropertiesMenu_BackNavigation_ReturnsToViewSettings", async () => {
    const { properties } = await openPropertiesMenu();

    const settings = await properties.backToViewSettings();

    expect(settings.heading("View Settings")).toBeVisible();
  });

  it("PropertiesMenu_NewPropertyNavigation_OpensPropertyTypes", async () => {
    const { properties } = await openPropertiesMenu();

    const types = await properties.openNewProperty();

    expect(types.heading()).toBeVisible();
  });
});
