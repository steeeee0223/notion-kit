import { describe, expect, it } from "vitest";

import { renderTableView } from "../__tests__/component-objects/render-table-view";
import { mockResizeObserver } from "../__tests__/mock";

mockResizeObserver();

async function openPropertyTypesMenu() {
  const tableView = renderTableView();
  const settings = await tableView.openViewSettings();
  const properties = await settings.openProperties();
  return properties.openNewProperty();
}

describe("TypesMenu", () => {
  it("PropertyTypesMenu_Open_ShowsHeadingAndSearch", async () => {
    const types = await openPropertyTypesMenu();

    expect(types.heading()).toBeVisible();
    expect(types.searchInput()).toBeVisible();
  });

  it.each(["Text", "Number", "Checkbox", "Date", "Email"])(
    "PropertyTypesMenu_Open_Shows%sType",
    async (type) => {
      const types = await openPropertyTypesMenu();

      expect(types.type(type)).toBeVisible();
    },
  );

  it("PropertyTypesMenu_BackNavigation_ReturnsToProperties", async () => {
    const types = await openPropertyTypesMenu();

    const properties = await types.backToProperties();

    expect(properties.heading()).toBeVisible();
  });

  it("PropertyTypesMenu_Open_ShowsTypeLabel", async () => {
    const types = await openPropertyTypesMenu();

    expect(types.typeLabel()).toBeVisible();
  });
});
