import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderTableView } from "@/__tests__/component-objects/render-table-view";
import { mockResizeObserver } from "@/__tests__/mock";

mockResizeObserver();

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

  it("PropertiesMenu_UnmatchedSearch_ShowsNoResults", async () => {
    const { properties } = await openPropertiesMenu();

    await properties.search("nonexistent");

    expect(properties.noResults()).toBeVisible();
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
