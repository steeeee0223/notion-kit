import { describe, expect, it, vi } from "vitest";

import type { ColumnInfo } from "@notion-kit/table-hook";

import { renderTableView } from "../__tests__/component-objects/render-table-view";
import { mockResizeObserver } from "../__tests__/mock";

mockResizeObserver();

async function openPropertyTypesMenu() {
  const tableView = renderTableView();
  const settings = await tableView.openViewSettings();
  const properties = await settings.openProperties();
  return properties.openNewProperty();
}

function lastCreateAction(callback: {
  mock: { lastCall: unknown[] | undefined };
}) {
  return (
    callback.mock.lastCall?.[0] as
      | { action: { type: string; payload: { property: Partial<ColumnInfo> } } }
      | undefined
  )?.action;
}

describe("TypesMenu", () => {
  it("PropertyTypesMenu_BackNavigation_ReturnsToProperties", async () => {
    const types = await openPropertyTypesMenu();

    const properties = await types.backToProperties();

    expect(properties.heading()).toBeVisible();
  });

  it.each([
    ["Text", "text"],
    ["Number", "number"],
    ["Checkbox", "checkbox"],
    ["Date", "date"],
    ["Email", "email"],
  ] as const)(
    "PropertyTypesMenu_%s_CreatesExpectedProperty",
    async (name, type) => {
      const onPropertiesChange = vi.fn();
      const tableView = renderTableView({ onPropertiesChange });
      const settings = await tableView.openViewSettings();
      const properties = await settings.openProperties();
      const types = await properties.openNewProperty();

      await tableView.user.click(types.type(name));

      const action = lastCreateAction(onPropertiesChange);
      expect(action?.type).toBe("properties.create");
      expect(action?.payload.property).toMatchObject({ type, name });
    },
  );

  it("PropertyTypesMenu_CustomName_CreatesTextProperty", async () => {
    const onPropertiesChange = vi.fn();
    const tableView = renderTableView({ onPropertiesChange });
    const settings = await tableView.openViewSettings();
    const properties = await settings.openProperties();
    const types = await properties.openNewProperty();

    await tableView.user.type(types.searchInput(), "Owner");
    await tableView.user.click(types.type("Owner"));

    const action = lastCreateAction(onPropertiesChange);
    expect(action?.type).toBe("properties.create");
    expect(action?.payload.property).toMatchObject({
      type: "text",
      name: "Owner",
    });
  });

  it("PropertyTypesMenu_TitleType_IsNotCreatable", async () => {
    const types = await openPropertyTypesMenu();

    expect(types.type("Title")).toHaveAttribute("aria-disabled", "true");
  });
});
