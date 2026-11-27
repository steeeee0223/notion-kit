import { screen, within } from "@testing-library/react";
import { expect, it } from "vitest";

import { MenuSurfaceObject } from "@/__tests__/component-objects/menu-surface";
import { renderTableView } from "@/__tests__/component-objects/render-table-view";
import { mockResizeObserver } from "@/__tests__/mock";

mockResizeObserver();

it("applies the Person limit in the cell picker", async () => {
  const ada = { id: "ada", name: "Ada Lovelace" };
  const grace = { id: "grace", name: "Grace Hopper" };
  const table = renderTableView({
    properties: [
      { id: "title", name: "Name", type: "title" },
      { id: "owner", name: "Person", type: "person" },
    ],
    data: [
      {
        id: "row",
        createdAt: 0,
        lastEditedAt: 0,
        properties: {
          title: { id: "row-title", value: "Trip" },
          owner: { id: "row-owner", value: [ada] },
        },
      },
    ],
    propertySources: { people: [ada, grace] },
  });

  await table.clickButton("Person");
  const menu = await MenuSurfaceObject.findByItem(table.user, "Edit property");
  menu.item("Edit property").focus();
  await table.user.keyboard("{ArrowRight}");
  const settings = await MenuSurfaceObject.findByItem(table.user, /^Limit/);
  settings.item(/^Limit/).focus();
  await table.user.keyboard("{ArrowRight}");
  await table.user.click(
    await screen.findByRole("menuitemradio", { name: "1 Person" }),
  );
  await table.clickOutside();

  const owner = table.propertyCell("Trip", "owner");
  await table.user.click(
    within(owner).getByRole("button", { name: /Ada Lovelace/ }),
  );
  expect(screen.getByText("Select one person")).toBeVisible();
  await table.user.click(screen.getByRole("option", { name: "Grace Hopper" }));
  await table.clickOutside();
  expect(within(owner).getByText("Grace Hopper")).toBeVisible();
  expect(within(owner).queryByText("Ada Lovelace")).toBeNull();
});
