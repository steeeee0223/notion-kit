import { screen, within } from "@testing-library/react";
import { expect, it } from "vitest";

import { MenuSurfaceObject } from "@/__tests__/component-objects/menu-surface";
import { PropertiesMenuObject } from "@/__tests__/component-objects/properties-menu";
import { renderTableView } from "@/__tests__/component-objects/render-table-view";
import { mockResizeObserver } from "@/__tests__/mock";

mockResizeObserver();

it("changes the displayed prefix while retaining the existing row number", async () => {
  const table = renderTableView({
    properties: [
      { id: "title", name: "Name", type: "title" },
      { id: "serial", name: "ID", type: "id", config: { prefix: "TASK" } },
    ],
    data: [
      {
        id: "row",
        createdAt: 0,
        lastEditedAt: 0,
        properties: { title: { id: "title-cell", value: "Trip" } },
      },
    ],
  });

  expect(
    within(table.propertyCell("Trip", "serial")).getByText("TASK-1"),
  ).toBeVisible();
  await table.clickButton("ID");
  const menu = await MenuSurfaceObject.findByItem(table.user, "Calculate");
  expect(menu.queryItem("Change type")).not.toBeInTheDocument();
  expect(menu.queryItem("Duplicate property")).not.toBeInTheDocument();
  expect(menu.item("Delete property")).toBeVisible();
  menu.item("Edit property").focus();
  await table.user.keyboard("{ArrowRight}");
  const prefix = await screen.findByRole("textbox", { name: "Prefix" });
  await table.user.clear(prefix);
  await table.user.type(prefix, "TRIP");
  expect(screen.getByText("TRIP-1, TRIP-2, TRIP-3, …")).toBeVisible();
  await table.user.click(screen.getByRole("button", { name: "Save prefix" }));
  await table.clickOutside();

  expect(
    within(table.propertyCell("Trip", "serial")).getByText("TRIP-1"),
  ).toBeVisible();
});

it("locks the ID type and prevents adding or converting a second ID", async () => {
  const table = renderTableView({
    properties: [
      { id: "title", name: "Name", type: "title" },
      { id: "serial", name: "ID", type: "id", hidden: true },
      { id: "notes", name: "Notes", type: "text" },
    ],
    data: [],
  });
  const settings = await table.openViewSettings();
  const properties = await settings.openProperties();
  const types = await properties.openNewProperty();
  expect(types.type("ID")).toHaveAttribute("aria-disabled", "true");

  let currentProperties = await types.backToProperties();
  await table.user.click(currentProperties.property("ID"));
  let edit = await MenuSurfaceObject.findByHeading(table.user, "Edit property");
  expect(edit.item("Type")).toHaveAttribute("aria-disabled", "true");
  expect(edit.queryItem("Duplicate property")).not.toBeInTheDocument();
  expect(edit.item("Delete property")).toBeVisible();

  await edit.back();
  currentProperties = await PropertiesMenuObject.find(table.user);
  await table.user.click(currentProperties.property("Notes"));
  edit = await MenuSurfaceObject.findByHeading(table.user, "Edit property");
  await table.user.click(edit.item("Type"));
  const changeTypes = await MenuSurfaceObject.findByHeading(
    table.user,
    "Change property type",
  );
  expect(changeTypes.item("ID")).toHaveAttribute("aria-disabled", "true");
});
