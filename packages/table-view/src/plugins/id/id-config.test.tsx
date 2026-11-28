import { screen, within } from "@testing-library/react";
import { expect, it } from "vitest";

import { MenuSurfaceObject } from "@/__tests__/component-objects/menu-surface";
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
  expect(menu.item("Change type")).toBeVisible();
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

it("restores an archived ID and allows a new ID only after permanent deletion", async () => {
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
        sequence: 12,
        properties: { title: { id: "title-cell", value: "Trip" } },
      },
    ],
  });

  await table.clickButton("ID");
  const menu = await MenuSurfaceObject.findByItem(
    table.user,
    "Delete property",
  );
  await table.user.click(menu.item("Delete property"));
  expect(screen.queryByRole("button", { name: "ID" })).not.toBeInTheDocument();

  const properties = await (await table.openViewSettings()).openProperties();
  const types = await properties.openNewProperty();
  expect(types.type("ID")).toHaveAttribute("aria-disabled", "true");
  const deleted = await (
    await types.backToProperties()
  ).openDeletedProperties();
  await deleted.restore("ID");
  await table.clickOutside();
  expect(within(table.row("Trip")).getByText("TASK-12")).toBeVisible();

  await table.clickButton("ID");
  const restored = await MenuSurfaceObject.findByItem(
    table.user,
    "Delete property",
  );
  await table.user.click(restored.item("Delete property"));
  const reopened = await (await table.openViewSettings()).openProperties();
  const archived = await reopened.openDeletedProperties();
  await archived.delete("ID");
  const newTypes = await (await archived.backToProperties()).openNewProperty();
  expect(newTypes.type("ID")).not.toHaveAttribute("aria-disabled", "true");
});

it("adds ID from New property and can hide and show it from Properties", async () => {
  const table = renderTableView({
    properties: [{ id: "title", name: "Name", type: "title" }],
    data: [
      {
        id: "row",
        createdAt: 0,
        lastEditedAt: 0,
        properties: { title: { id: "title-cell", value: "Trip" } },
      },
    ],
  });
  const properties = await (await table.openViewSettings()).openProperties();
  expect(properties.queryProperty("ID")).not.toBeInTheDocument();
  expect(properties.visibilityButton("Name")).toBeDisabled();
  const types = await properties.openNewProperty();
  await table.user.click(types.type("ID"));
  await MenuSurfaceObject.findByHeading(table.user, "Edit property");
  await table.clickOutside();
  expect(within(table.row("Trip")).getByText("1")).toBeVisible();

  await table.clickButton("ID");
  const menu = await MenuSurfaceObject.findByItem(table.user, "Calculate");
  await table.user.click(menu.item("Hide in view"));
  expect(screen.queryByRole("button", { name: "ID" })).not.toBeInTheDocument();

  const reopened = await (await table.openViewSettings()).openProperties();
  const typesWithId = await reopened.openNewProperty();
  expect(typesWithId.type("ID")).toHaveAttribute("aria-disabled", "true");
  const propertiesWithId = await typesWithId.backToProperties();
  await table.user.click(propertiesWithId.visibilityButton("ID"));
  await table.clickOutside();
  expect(within(table.row("Trip")).getByText("1")).toBeVisible();
});
