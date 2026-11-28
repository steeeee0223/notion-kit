import { act, screen, waitFor, within } from "@testing-library/react";
import { expect, it, vi } from "vitest";

import type {
  DataResourceAction,
  ResourceChangeHandler,
  Row,
} from "@notion-kit/table-hook";
import type { LocationValue } from "@notion-kit/table-hook/plugins";

import { renderTableView } from "@/__tests__/component-objects/render-table-view";
import { mockResizeObserver } from "@/__tests__/mock";

mockResizeObserver();

it("suggests a place after one keystroke and saves its coordinates", async () => {
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
  expect(
    screen.getByRole("option", { name: "Current Location" }),
  ).toBeVisible();
  expect(screen.queryByRole("link", { name: "Learn more" })).toBeNull();
  await table.user.type(
    screen.getByRole("combobox", { name: "Search places" }),
    "s",
  );
  expect(screen.getByText("Loading...")).toBeVisible();
  expect(screen.getByRole("link", { name: "Learn more" })).toBeVisible();

  const option = await screen.findByRole("option", {
    name: "Main Station, Taipei",
  });
  expect(within(option).getByText("S")).toBeVisible();
  expect(
    screen.getByRole("option", { name: "Current Location" }),
  ).toBeVisible();
  await table.user.click(option);

  expect(searchLocations).toHaveBeenCalledWith("s", expect.any(AbortSignal));
  expect(onDataChange.mock.lastCall?.[0]).toMatchObject({
    action: {
      type: "data.cell.update",
      payload: { rowId: "row", propertyId: "place", nextValue: place },
    },
    next: [{ id: "row", properties: { place: { value: place } } }],
  });
  expect(
    within(table.propertyCell("Trip", "place")).getByText("Main Station"),
  ).toBeVisible();
});

it("cancels stale suggestions and returns to Current Location when cleared", async () => {
  let resolveFirst!: (places: LocationValue[]) => void;
  const first = new Promise<LocationValue[]>((resolve) => {
    resolveFirst = resolve;
  });
  const searchLocations = vi
    .fn<(query: string, signal: AbortSignal) => Promise<LocationValue[]>>()
    .mockReturnValueOnce(first)
    .mockResolvedValueOnce([{ name: "Station", address: "Taipei" }]);
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
  });

  await table.user.click(
    within(table.propertyCell("Trip", "place")).getByRole("button"),
  );
  const input = screen.getByRole("combobox", { name: "Search places" });
  await table.user.type(input, "s");
  await waitFor(() =>
    expect(searchLocations).toHaveBeenCalledWith("s", expect.any(AbortSignal)),
  );
  const firstSignal = searchLocations.mock.calls[0]?.[1];

  await table.user.type(input, "t");
  expect(
    await screen.findByRole("option", { name: "Station, Taipei" }),
  ).toBeVisible();
  expect(firstSignal?.aborted).toBe(true);
  await act(async () => {
    resolveFirst([{ name: "Stale result", address: "Taipei" }]);
    await first;
  });
  expect(screen.queryByRole("option", { name: /Stale result/ })).toBeNull();

  await table.user.clear(input);
  expect(
    screen.getByRole("option", { name: "Current Location" }),
  ).toBeVisible();
  expect(screen.queryByRole("option", { name: "Station, Taipei" })).toBeNull();
  expect(screen.queryByRole("link", { name: "Learn more" })).toBeNull();
  await table.user.keyboard("{Escape}");
  await waitFor(() => expect(input).not.toBeInTheDocument());
});

it("saves the browser location after reverse geocoding", async () => {
  const coordinates = { latitude: 25.046, longitude: 121.517 };
  const position: GeolocationPosition = {
    coords: {
      ...coordinates,
      accuracy: 5,
      altitude: null,
      altitudeAccuracy: null,
      heading: null,
      speed: null,
      toJSON: () => coordinates,
    },
    timestamp: 0,
    toJSON: () => coordinates,
  };
  const resolvedPlace = {
    name: "Main Station",
    address: "Taipei",
  };
  const reverseGeocode = vi.fn().mockResolvedValue(resolvedPlace);
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
    propertySources: { reverseGeocode },
    onDataChange,
  });
  const originalGeolocation = Object.getOwnPropertyDescriptor(
    navigator,
    "geolocation",
  );
  Object.defineProperty(navigator, "geolocation", {
    configurable: true,
    value: {
      getCurrentPosition: (success: PositionCallback) => {
        setTimeout(() => success(position), 0);
      },
    },
  });

  try {
    await table.user.click(
      within(table.propertyCell("Trip", "place")).getByRole("button"),
    );
    await table.user.click(
      screen.getByRole("option", { name: "Current Location" }),
    );

    expect(await screen.findByText("Main Station")).toBeVisible();
    expect(reverseGeocode).toHaveBeenCalledWith(
      coordinates,
      expect.any(AbortSignal),
    );
    expect(onDataChange.mock.lastCall?.[0]).toMatchObject({
      next: [
        {
          id: "row",
          properties: { place: { value: { ...resolvedPlace, coordinates } } },
        },
      ],
    });
  } finally {
    if (originalGeolocation) {
      Object.defineProperty(navigator, "geolocation", originalGeolocation);
    } else {
      Reflect.deleteProperty(navigator, "geolocation");
    }
  }
});
