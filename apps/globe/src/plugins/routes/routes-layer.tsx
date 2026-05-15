import { MapRoute } from "@notion-kit/map";

import { useActiveRouteShapes } from "@/adapters";
import { useVehicleStore } from "@/plugins/vehicles/store";
import { getVehicleColor } from "@/plugins/vehicles/use-vehicle-geojson";

export function RoutesLayer() {
  const selected = useVehicleStore((state) => state.selectedVehicle);
  const { data: shapes = [] } = useActiveRouteShapes(selected?.routeId ?? null);

  if (!selected || shapes.length === 0) return null;

   
  const routeColor = selected.routeColor || getVehicleColor(selected.vehicleType);

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
          interactive={false}
        />
      ))}
    </>
  );
}
