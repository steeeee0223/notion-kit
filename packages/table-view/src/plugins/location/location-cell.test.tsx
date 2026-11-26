import { screen, within } from "@testing-library/react";
import { expect, it, vi } from "vitest";

import type {
  DataResourceAction,
  ResourceChangeHandler,
  Row,
} from "@notion-kit/table-hook";

import { renderTableView } from "@/__tests__/component-objects/render-table-view";
import { mockResizeObserver } from "@/__tests__/mock";

mockResizeObserver();

it("selects a place by name or address and persists its coordinates", async () => {
  const place = {
    name: "Main Station",
    address: "Taipei",
    coordinates: { latitude: 25.046, longitude: 121.517 },
  };
  const searchLocations = vi.fn().mockResolvedValue([place]);
  const onDataChange =
    vi.fn<ResourceChangeHandler<Row[], DataResourceAction>>();
  const table = renderTableView({
    properties: [
      { id: "title", name: "Name", type: "title" },
      { id: "place", name: "Place", type: "location" },
    ],
    data: [
      {
        id: "row",
        createdAt: 0,
        lastEditedAt: 0,
        properties: { title: { id: "name-cell", value: "Trip" } },
      },
    ],
    propertySources: { searchLocations },
    onDataChange,
  });

  await table.user.click(
    within(table.propertyCell("Trip", "place")).getByRole("button"),
  );
  await table.user.type(
    screen.getByRole("combobox", { name: "Search places" }),
    "Taipei",
  );
  await table.user.click(
    await screen.findByRole("option", { name: "Main Station · Taipei" }),
  );

  expect(searchLocations).toHaveBeenCalledWith(
    "Taipei",
    expect.any(AbortSignal),
  );
  expect(onDataChange.mock.lastCall?.[0].action).toMatchObject({
    payload: { nextValue: place },
  });
  expect(
    within(table.propertyCell("Trip", "place")).getByText("Main Station"),
  ).toBeVisible();
});
