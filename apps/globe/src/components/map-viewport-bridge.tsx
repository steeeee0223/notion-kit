import { useEffect } from "react";

import { useMap, useMapState } from "@notion-kit/map";

import { useAdapterBBoxStore } from "@/adapters";

export function MapViewportBridge() {
  const { map } = useMap();
  const setBBoxAndZoom = useAdapterBBoxStore((state) => state.setBBoxAndZoom);
  const flyTo = useAdapterBBoxStore((state) => state.flyTo);
  const clearFlyTo = useAdapterBBoxStore((state) => state.clearFlyTo);

  const bbox = useMapState(
    (map) => {
      const bounds = map.getBounds();
      return `${bounds.getWest()},${bounds.getSouth()},${bounds.getEast()},${bounds.getNorth()}`;
    },
    "",
    { events: ["moveend"] },
  );

  const zoom = useMapState((map) => map.getZoom(), 0, { events: ["zoomend"] });

  useEffect(() => {
    if (!bbox || !zoom) return;
    setBBoxAndZoom(bbox, zoom);
  }, [bbox, zoom, setBBoxAndZoom]);

  useEffect(() => {
    if (!flyTo) return;

    map?.flyTo({ center: flyTo, zoom: 12, speed: 1.5 });
    clearFlyTo();
  }, [flyTo, map, clearFlyTo]);

  return null;
}
