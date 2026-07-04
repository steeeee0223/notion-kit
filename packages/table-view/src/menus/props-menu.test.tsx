import { describe, expect, it } from "vitest";

import { renderTableView } from "@/__tests__/component-objects/render-table-view";
import { mockResizeObserver } from "@/__tests__/mock";

mockResizeObserver();

async function openPropertiesMenu() {
  const tableView = renderTableView();
  const settings = await tableView.openViewSettings();
  return { tableView, properties: await settings.openProperties() };
}

describe("PropsMenu", () => {
  it("PropertiesMenu_Open_ShowsSearchAndMoveHandles", async () => {
    const { properties } = await openPropertiesMenu();

    expect(properties.heading()).toBeVisible();
    expect(properties.searchInput()).toBeVisible();
    expect(properties.moveHandle("Name")).toBeVisible();
  });

  it("PropertiesMenu_Open_ShowsAllProperties", async () => {
    const { properties } = await openPropertiesMenu();

    expect(properties.property("Name")).toBeVisible();
    expect(properties.property("Done")).toBeVisible();
  });

  it("PropertiesMenu_Open_ShowsNewPropertyAction", async () => {
    const { properties } = await openPropertiesMenu();

    expect(properties.newPropertyItem()).toBeVisible();
  });

  it("PropertiesMenu_Open_ShowsHelpAction", async () => {
    const { properties } = await openPropertiesMenu();

    expect(properties.helpItem()).toBeVisible();
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

  it("PropertiesMenu_VisibilityToggle_TargetsNamedProperty", async () => {
    const { tableView, properties } = await openPropertiesMenu();
    const doneVisibilityButton = properties.visibilityButton("Done");

    await tableView.user.click(doneVisibilityButton);

    expect(doneVisibilityButton).toBeInTheDocument();
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
