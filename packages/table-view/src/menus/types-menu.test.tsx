import { describe, expect, it, vi } from "vitest";

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

  it("PropertyTypesMenu_KnownType_CreatesNamedProperty", async () => {
    const onPropertiesChange = vi.fn();
    const tableView = renderTableView({ onPropertiesChange });
    const settings = await tableView.openViewSettings();
    const properties = await settings.openProperties();
    const types = await properties.openNewProperty();

    await tableView.user.click(types.type("Number"));

    expect(onPropertiesChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        action: expect.objectContaining({
          type: "properties.create",
          payload: expect.objectContaining({
            property: expect.objectContaining({
              type: "number",
              name: "Number",
            }),
          }),
        }),
      }),
    );
  });

  it("PropertyTypesMenu_CustomName_CreatesTextProperty", async () => {
    const onPropertiesChange = vi.fn();
    const tableView = renderTableView({ onPropertiesChange });
    const settings = await tableView.openViewSettings();
    const properties = await settings.openProperties();
    const types = await properties.openNewProperty();

    await tableView.user.type(types.searchInput(), "Owner");
    await tableView.user.click(types.type("Owner"));

    expect(onPropertiesChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        action: expect.objectContaining({
          type: "properties.create",
          payload: expect.objectContaining({
            property: expect.objectContaining({
              type: "text",
              name: "Owner",
            }),
          }),
        }),
      }),
    );
  });

  it("PropertyTypesMenu_TitleType_IsNotCreatable", async () => {
    const types = await openPropertyTypesMenu();

    expect(types.type("Title")).toHaveAttribute("aria-disabled", "true");
  });
});
