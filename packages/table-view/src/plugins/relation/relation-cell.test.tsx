import { screen, waitFor, within } from "@testing-library/react";
import { expect, it, vi } from "vitest";

import type {
  ColumnDefs,
  PropertiesResourceAction,
  ResourceChangeHandler,
} from "@notion-kit/table-hook";
import type {
  RelationConfig,
  RollupConfig,
} from "@notion-kit/table-hook/plugins";

import { MenuSurfaceObject } from "@/__tests__/component-objects/menu-surface";
import { renderTableView } from "@/__tests__/component-objects/render-table-view";
import { mockResizeObserver } from "@/__tests__/mock";

mockResizeObserver();

it("links a related page through the cell picker and shows its value in a rollup", async () => {
  const table = renderTableView({
    properties: [
      { id: "title", name: "Name", type: "title" },
      { id: "price", name: "Price", type: "number" },
      {
        id: "related",
        name: "Related",
        type: "relation",
        config: { databaseId: "self", limit: "one" } satisfies RelationConfig,
      },
      {
        id: "total",
        name: "Total",
        type: "rollup",
        config: {
          relationPropertyId: "related",
          targetPropertyId: "price",
          calculation: "sum",
          format: "number",
          round: "default",
        } satisfies RollupConfig,
      },
    ],
    data: [
      {
        id: "order",
        createdAt: 0,
        lastEditedAt: 0,
        properties: {
          title: { id: "order-title", value: "Order" },
          price: { id: "order-price", value: null },
        },
      },
      {
        id: "item",
        createdAt: 0,
        lastEditedAt: 0,
        properties: {
          title: { id: "item-title", value: "Train ticket" },
          price: { id: "item-price", value: "125" },
        },
      },
    ],
  });

  await table.user.click(
    within(table.propertyCell("Order", "related")).getByRole("button"),
  );
  await table.user.type(
    screen.getByRole("combobox", { name: "Search related pages" }),
    "Train",
  );
  await table.user.click(
    await screen.findByRole("option", { name: "Train ticket" }),
  );
  expect(
    screen.queryByRole("combobox", { name: "Search related pages" }),
  ).not.toBeInTheDocument();

  expect(
    within(table.propertyCell("Order", "related")).getByText("Train ticket"),
  ).toBeVisible();
  expect(
    within(table.propertyCell("Order", "total")).getByText("125"),
  ).toBeVisible();
});

it("creates a named reciprocal property and fills it for existing links", async () => {
  const onPropertiesChange =
    vi.fn<ResourceChangeHandler<ColumnDefs, PropertiesResourceAction>>();
  const table = renderTableView({
    properties: [
      { id: "title", name: "Name", type: "title" },
      {
        id: "related",
        name: "Related",
        type: "relation",
        config: { databaseId: "self", limit: "one" } satisfies RelationConfig,
      },
    ],
    data: [
      {
        id: "order",
        createdAt: 0,
        lastEditedAt: 0,
        properties: {
          title: { id: "order-title", value: "Order" },
          related: {
            id: "order-related",
            value: [{ id: "item", name: "Train ticket" }],
          },
        },
      },
      {
        id: "item",
        createdAt: 0,
        lastEditedAt: 0,
        properties: { title: { id: "item-title", value: "Train ticket" } },
      },
    ],
    onPropertiesChange,
  });

  await table.clickButton("Related");
  const menu = await MenuSurfaceObject.findByItem(table.user, "Edit property");
  menu.item("Edit property").focus();
  await table.user.keyboard("{ArrowRight}");
  const name = await screen.findByRole("textbox", {
    name: "Related property name",
  });
  await table.user.clear(name);
  await table.user.type(name, "Referenced by");
  expect(name).toHaveValue("Referenced by");
  await table.user.click(
    screen.getByRole("button", { name: "Create two-way relation" }),
  );
  await table.clickOutside();

  const reciprocal = onPropertiesChange.mock.lastCall?.[0].next.find(
    ({ name }) => name === "Referenced by",
  );
  expect(reciprocal).toMatchObject({
    type: "relation",
    config: { reciprocalPropertyId: "related" },
  });
  await waitFor(() =>
    expect(
      within(table.propertyCell(/^Train ticket/, reciprocal!.id)).getByText(
        "Order",
      ),
    ).toBeVisible(),
  );
});
