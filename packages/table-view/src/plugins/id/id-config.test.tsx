import { within } from "@testing-library/react";
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
  expect(menu.queryItem("Group")).toBeNull();
  const prefix = within(menu.root).getByRole("textbox", { name: "Prefix" });
  await table.user.clear(prefix);
  await table.user.type(prefix, "TRIP");
  await table.user.click(menu.button("Save prefix"));
  await table.clickOutside();

  expect(
    within(table.propertyCell("Trip", "serial")).getByText("TRIP-1"),
  ).toBeVisible();
});
