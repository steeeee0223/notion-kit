import { useCallback, useEffect, useMemo, useRef } from "react";
import type MapLibreGL from "maplibre-gl";

import { useMap } from "@notion-kit/map";

import { useActiveRouteStops } from "@/adapters";
import type { RouteStop } from "@/adapters";
import { useRouteStore } from "@/plugins/routes/store";
import { useVehicleStore } from "@/plugins/vehicles/store";
import { getVehicleColor } from "@/plugins/vehicles/use-vehicle-geojson";

import { useStopsStore } from "./store";

const SOURCE_ID = "route-stops";
const CIRCLE_LAYER_ID = "route-stops-circle";
const LABEL_LAYER_ID = "route-stops-label";

type StopFeatureCollection = GeoJSON.FeatureCollection<
  GeoJSON.Point,
  RouteStop & { _color: string }
>;

export function StopsLayer() {
  const { map, isLoaded } = useMap();
  const selected = useVehicleStore((state) => state.selectedVehicle);
  const selectedRouteContext = useRouteStore(
    (state) => state.selectedRouteContext,
  );
  const mapRouteContext = useRouteStore((state) => state.mapRouteContext);
  const mapStop = useStopsStore((state) => state.mapStop);
  const setSelectedStop = useStopsStore((state) => state.setSelectedStop);
  const onClickRef = useRef(setSelectedStop);
  onClickRef.current = setSelectedStop;

  const context = selectedRouteContext ??
    mapRouteContext ?? {
      tripId: selected?.tripId,
      routeId: selected?.routeId,
    };

  const { data: stops = [] } = useActiveRouteStops(context);

  let routeColor =
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    selected?.routeColor || getVehicleColor(selected?.vehicleType || "UNKNOWN");
  if (routeColor && !routeColor.startsWith("#")) {
    routeColor = `#${routeColor}`;
  }

  const geojson = useMemo<StopFeatureCollection>(() => {
    const stopById = new Map(stops.map((stop) => [stop.id, stop]));
    if (mapStop) stopById.set(mapStop.id, mapStop);

    const features = Array.from(stopById.values()).map<
      GeoJSON.Feature<GeoJSON.Point, RouteStop & { _color: string }>
    >((stop) => ({
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [stop.longitude, stop.latitude],
      },
      properties: { ...stop, _color: routeColor },
    }));
    return { type: "FeatureCollection", features };
  }, [mapStop, stops, routeColor]);

  const handleStopClick = useCallback(
    (feature: GeoJSON.Feature<GeoJSON.Point, RouteStop>) => {
      const props = feature.properties;
      onClickRef.current(props);
    },
    [],
  );

  useEffect(() => {
    if (!isLoaded || !map) return;

    map.addSource(SOURCE_ID, {
      type: "geojson",
      data: geojson,
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
          10,
          3,
          14,
          7,
          18,
          10,
        ],
        "circle-color": "#ffffff",
        "circle-stroke-width": 2,
        "circle-stroke-color": ["get", "_color"],
        "circle-opacity": 0.95,
      },
    });

    map.addLayer({
      id: LABEL_LAYER_ID,
      type: "symbol",
      source: SOURCE_ID,
      minzoom: 14,
      layout: {
        "text-field": ["get", "stopName"],
        "text-font": ["Open Sans Bold"],
        "text-size": 11,
        "text-offset": [0, 1.5],
        "text-anchor": "top",
        "text-allow-overlap": false,
        "text-max-width": 12,
      },
      paint: {
        "text-color": "#ffffff",
        "text-halo-color": "rgba(0, 0, 0, 0.75)",
        "text-halo-width": 1.5,
      },
    });

    const handleClick = (
      e: MapLibreGL.MapMouseEvent & {
        features?: MapLibreGL.MapGeoJSONFeature[];
      },
    ) => {
      e.preventDefault();
      if (!e.features?.length) return;
      const feature = e.features[0];
      if (!feature) return;
      handleStopClick(
        feature as unknown as GeoJSON.Feature<GeoJSON.Point, RouteStop>,
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
      source.setData(geojson);
    }
  }, [isLoaded, map, geojson]);

  return null;
}
