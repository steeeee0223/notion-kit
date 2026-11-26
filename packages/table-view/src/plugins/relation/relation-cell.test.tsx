import { screen, within } from "@testing-library/react";
import { expect, it } from "vitest";

import type {
  RelationConfig,
  RollupConfig,
} from "@notion-kit/table-hook/plugins";

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
  await table.clickOutside();

  expect(
    within(table.propertyCell("Order", "related")).getByText("Train ticket"),
  ).toBeVisible();
  expect(
    within(table.propertyCell("Order", "total")).getByText("125"),
  ).toBeVisible();
});
