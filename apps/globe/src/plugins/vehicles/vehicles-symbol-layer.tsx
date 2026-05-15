import { useEffect, useRef } from "react";
import type MapLibreGL from "maplibre-gl";

import { useMap } from "@notion-kit/map";

import type { VehicleFeatureCollection } from "./use-vehicle-geojson";

const SOURCE_ID = "transit-vehicles";
const CIRCLE_LAYER_ID = "transit-vehicles-circle";
const LABEL_LAYER_ID = "transit-vehicles-label";

interface VehiclesSymbolLayerProps {
  data: VehicleFeatureCollection;
  onPointClick?: (
    feature: GeoJSON.Feature<GeoJSON.Point>,
    coordinates: [number, number],
  ) => void;
}

export function VehiclesSymbolLayer({
  data,
  onPointClick,
}: VehiclesSymbolLayerProps) {
  const { map, isLoaded } = useMap();
  const onPointClickRef = useRef(onPointClick);
  onPointClickRef.current = onPointClick;

  useEffect(() => {
    if (!isLoaded || !map) return;

    if (!map.hasImage("badge-bg")) {
      const size = 12;
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "black";
        ctx.beginPath();
        ctx.roundRect(0, 0, size, size, 4);
        ctx.fill();
        map.addImage("badge-bg", ctx.getImageData(0, 0, size, size), {
          sdf: true,
          stretchX: [[4, 8]],
          stretchY: [[4, 8]],
          content: [4, 4, 8, 8],
        });
      }
    }

    map.addSource(SOURCE_ID, {
      type: "geojson",
      data,
    });

    map.addLayer({
      id: CIRCLE_LAYER_ID,
      type: "circle",
      source: SOURCE_ID,
      paint: {
        "circle-radius": [
          "interpolate",
          ["linear"],
          ["zoom"],
          8,
          3,
          12,
          6,
          16,
          10,
        ],
        "circle-color": ["get", "_color"],
        "circle-stroke-width": 2,
        "circle-stroke-color": "#ffffff",
        "circle-opacity": 0.9,
      },
    });

    map.addLayer({
      id: LABEL_LAYER_ID,
      type: "symbol",
      source: SOURCE_ID,
      minzoom: 13,
      layout: {
        "text-field": ["get", "routeShortName"],
        "text-font": ["Open Sans Bold"],
        "text-size": 9,
        "text-offset": [0, -2.2],
        "text-anchor": "bottom",
        "text-allow-overlap": false,
        "icon-image": "badge-bg",
        "icon-text-fit": "both",
        "icon-text-fit-padding": [0, 4, 0, 4],
        "icon-offset": [0, -2.2],
        "icon-anchor": "bottom",
      },
      paint: {
        "text-color": "#ffffff",
        "icon-color": ["get", "_color"],
      },
    });

    const handleClick = (
      e: MapLibreGL.MapMouseEvent & {
        features?: MapLibreGL.MapGeoJSONFeature[];
      },
    ) => {
      if (!e.features?.length) return;
      const feature = e.features[0];
      if (!feature) return;

      const geometry = feature.geometry as GeoJSON.Point;
      const coords = geometry.coordinates.slice() as [number, number];

      while (Math.abs(e.lngLat.lng - coords[0]) > 180) {
        coords[0] += e.lngLat.lng > coords[0] ? 360 : -360;
      }

      onPointClickRef.current?.(
        feature as unknown as GeoJSON.Feature<GeoJSON.Point>,
        coords,
      );
    };

    const handleMouseEnter = () => {
      map.getCanvas().style.cursor = "pointer";
    };
    const handleMouseLeave = () => {
      map.getCanvas().style.cursor = "";
    };

    map.on("click", CIRCLE_LAYER_ID, handleClick);
    map.on("mouseenter", CIRCLE_LAYER_ID, handleMouseEnter);
    map.on("mouseleave", CIRCLE_LAYER_ID, handleMouseLeave);

    return () => {
      map.off("click", CIRCLE_LAYER_ID, handleClick);
      map.off("mouseenter", CIRCLE_LAYER_ID, handleMouseEnter);
      map.off("mouseleave", CIRCLE_LAYER_ID, handleMouseLeave);

      try {
        if (map.getLayer(LABEL_LAYER_ID)) map.removeLayer(LABEL_LAYER_ID);
        if (map.getLayer(CIRCLE_LAYER_ID)) map.removeLayer(CIRCLE_LAYER_ID);
        if (map.getSource(SOURCE_ID)) map.removeSource(SOURCE_ID);
      } catch {
        // ignore cleanup errors during unmount
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, map]);

  useEffect(() => {
    if (!isLoaded || !map) return;

    const source = map.getSource(SOURCE_ID);
    // @ts-expect-error - MapLibre GL JS types don't expose setData on the base Source type
    if (source?.setData) {
      // @ts-expect-error - see above
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      source.setData(data);
    }
  }, [isLoaded, map, data]);

  return null;
}
