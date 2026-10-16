import { screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { MenuSurfaceObject } from "@/__tests__/component-objects/menu-surface";
import { PropertiesMenuObject } from "@/__tests__/component-objects/properties-menu";
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

  it("PropertiesMenu_Search_FiltersPropertiesAndKeepsMatchesClickable", async () => {
    const { tableView, properties } = await openPropertiesMenu();
    await properties.search("Done");
    expect(properties.queryProperty("Name")).not.toBeInTheDocument();

    await tableView.user.click(properties.property("Done"));

    const edit = await MenuSurfaceObject.findByHeading(
      tableView.user,
      "Edit property",
    );
    expect(edit.heading("Edit property")).toBeVisible();
  });

  it("PropertiesMenu_HeaderNavigation_ClosesPopupAndOpensSharedEditor", async () => {
    const tableView = renderTableView();
    await tableView.clickButton("Properties");
    const properties = await PropertiesMenuObject.find(tableView.user);
    await properties.search("Done");

    await tableView.user.click(properties.property("Done"));

    await properties.waitUntilClosed();
    const edit = await MenuSurfaceObject.findByHeading(
      tableView.user,
      "Edit property",
    );
    expect(edit.heading("Edit property")).toBeVisible();
    expect(tableView.button("Properties")).toHaveAttribute(
      "aria-expanded",
      "false",
    );
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
});
