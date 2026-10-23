import { render } from "@testing-library/react";
import { expect, it, vi } from "vitest";

import { MapClusterLayer } from "../map-cluster-layer";

const { handlers, map } = vi.hoisted(() => {
  interface ClickEvent {
    point: { x: number; y: number };
  }
  const handlers = new Map<string, Set<(event: ClickEvent) => void>>();
  const map = {
    addSource: vi.fn(),
    addLayer: vi.fn(),
    getSource: vi.fn(),
    getLayer: vi.fn(),
    queryRenderedFeatures: () => [
      {
        properties: { cluster_id: 1, point_count: 2 },
        geometry: { type: "Point", coordinates: [121.54, 25.05] },
      },
    ],
    on: (type: string, layer: string, handler: (event: ClickEvent) => void) => {
      const key = `${type}:${layer}`;
      const listeners = handlers.get(key) ?? new Set();
      listeners.add(handler);
      handlers.set(key, listeners);
    },
    off: (
      type: string,
      layer: string,
      handler: (event: ClickEvent) => void,
    ) => {
      handlers.get(`${type}:${layer}`)?.delete(handler);
    },
  };
  return { handlers, map };
});

vi.mock("../use-map", () => ({
  useMap: () => ({ map, isLoaded: true }),
}));

it("MapClusterLayer_CallbackChanges_KeepsOneClusterClickSubscription", () => {
  const data: GeoJSON.FeatureCollection<GeoJSON.Point> = {
    type: "FeatureCollection",
    features: [],
  };
  const firstClick = vi.fn();
  const latestClick = vi.fn();
  const { rerender, unmount } = render(
    <MapClusterLayer data={data} onClusterClick={firstClick} />,
  );

  rerender(<MapClusterLayer data={data} onClusterClick={latestClick} />);
  rerender(
    <MapClusterLayer
      data={data}
      onClusterClick={latestClick}
      onPointClick={vi.fn()}
    />,
  );

  const clusterClicks = [...handlers.entries()].find(([key]) =>
    key.startsWith("click:clusters-"),
  )?.[1];
  expect(clusterClicks?.size).toBe(1);
  clusterClicks?.forEach((handler) => handler({ point: { x: 0, y: 0 } }));
  expect(firstClick).not.toHaveBeenCalled();
  expect(latestClick).toHaveBeenCalledExactlyOnceWith(1, [121.54, 25.05], 2);

  unmount();
  expect(
    [...handlers.values()].every((listeners) => listeners.size === 0),
  ).toBe(true);
});
