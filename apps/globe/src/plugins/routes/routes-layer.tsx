import { useEffect } from "react";

import { MapRoute, useMap } from "@notion-kit/map";

import { useActiveRouteShapes } from "@/adapters";
import { useRouteStore } from "@/plugins/routes/store";
import { useVehicleStore } from "@/plugins/vehicles/store";
import { getVehicleColor } from "@/plugins/vehicles/use-vehicle-geojson";

export function RoutesLayer() {
  const { map } = useMap();
  const selectedVehicle = useVehicleStore((state) => state.selectedVehicle);
  const selectedRouteContext = useRouteStore(
    (state) => state.selectedRouteContext,
  );
  const mapRouteContext = useRouteStore((state) => state.mapRouteContext);
  const setMapRouteContext = useRouteStore((state) => state.setMapRouteContext);

  const context = selectedRouteContext ??
    mapRouteContext ?? {
      tripId: selectedVehicle?.tripId,
      routeId: selectedVehicle?.routeId,
      routeColor: selectedVehicle?.routeColor,
    };

  const { data: shapes = [] } = useActiveRouteShapes(context);

  useEffect(() => {
    if (!map || !mapRouteContext?.fitBounds || shapes.length === 0) return;
    const bounds = getRouteBounds(shapes);
    if (!bounds) return;

    map.fitBounds(bounds, {
      padding: 80,
      maxZoom: 14,
      duration: 800,
    });
    setMapRouteContext({ ...mapRouteContext, fitBounds: false });
  }, [map, mapRouteContext, setMapRouteContext, shapes]);

  if (
    (!selectedVehicle && !selectedRouteContext && !mapRouteContext) ||
    shapes.length === 0
  )
    return null;

  let routeColor =
    context.routeColor ??
    selectedVehicle?.routeColor ??
    getVehicleColor(selectedVehicle?.vehicleType ?? "UNKNOWN");
  if (routeColor && !routeColor.startsWith("#")) {
    routeColor = `#${routeColor}`;
  }

  return (
    <>
      {shapes.map((shape) => (
        <MapRoute
          key={shape.shapeId}
          id={shape.shapeId}
          coordinates={shape.points}
          color={routeColor}
          width={4}
          opacity={0.7}
          interactive={true}
          onClick={() => {
            useRouteStore.getState().setSelectedRouteContext({
              ...context,
              fitBounds: false,
              routeId: context.routeId ?? shape.routeId,
              routeColor,
            });
          }}
        />
      ))}
    </>
  );
}

function getRouteBounds(
  shapes: { points: [number, number][] }[],
): [[number, number], [number, number]] | null {
  let minLng = Infinity;
  let minLat = Infinity;
  let maxLng = -Infinity;
  let maxLat = -Infinity;

  for (const shape of shapes) {
    for (const [lng, lat] of shape.points) {
      minLng = Math.min(minLng, lng);
      minLat = Math.min(minLat, lat);
      maxLng = Math.max(maxLng, lng);
      maxLat = Math.max(maxLat, lat);
    }
  }

  if (![minLng, minLat, maxLng, maxLat].every(Number.isFinite)) return null;
  return [
    [minLng, minLat],
    [maxLng, maxLat],
  ];
}
