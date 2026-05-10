import { useEffect, useId } from "react";

import { useMap } from "./use-map";

export interface MapRouteProps {
  coordinates: [number, number][];
  color?: string;
  width?: number;
  opacity?: number;
  dashArray?: [number, number];
  id?: string;
}

function MapRoute({
  coordinates,
  color = "#4285F4",
  width = 3,
  opacity = 0.8,
  dashArray,
  id: propId,
}: MapRouteProps) {
  const { map } = useMap();
  const autoId = useId();
  const id = propId ?? `route-${autoId}`;

  useEffect(() => {
    if (!map || coordinates.length < 2) return;

    const sourceId = `${id}-source`;
    const layerId = `${id}-layer`;

    map.addSource(sourceId, {
      type: "geojson",
      data: {
        type: "Feature",
        properties: {},
        geometry: {
          type: "LineString",
          coordinates,
        },
      },
    });

    map.addLayer({
      id: layerId,
      type: "line",
      source: sourceId,
      layout: {
        "line-join": "round",
        "line-cap": "round",
      },
      paint: {
        "line-color": color,
        "line-width": width,
        "line-opacity": opacity,
        ...(dashArray ? { "line-dasharray": dashArray } : {}),
      },
    });

    return () => {
      try {
        if (map.getLayer(layerId)) map.removeLayer(layerId);
        if (map.getSource(sourceId)) map.removeSource(sourceId);
      } catch {
        // map may already be removed
      }
    };
  }, [map, id, coordinates, color, width, opacity, dashArray]);

  return null;
}

export { MapRoute };
