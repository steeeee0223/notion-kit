import { useCallback, useState } from "react";
import { formatDistanceToNow } from "date-fns";

import { MapPopup, MapRoute } from "@notion-kit/map";

import { useTransitFilter } from "@/plugins/transit/transit-panel";
import { TransitSymbolLayer } from "@/plugins/transit/transit-symbol-layer";
import { useRouteShapes } from "@/plugins/transit/use-route-shapes";
import {
  getVehicleColor,
  useVehicleGeoJSON,
} from "@/plugins/transit/use-vehicle-geojson";
import {
  useVehiclePositions,
  type VehiclePosition,
} from "@/plugins/transit/use-vehicle-positions";

export function TransitLayer() {
  const { data: vehicles = [] } = useVehiclePositions();
  const hiddenTypes = useTransitFilter((state) => state.hiddenTypes);
  const geojson = useVehicleGeoJSON(vehicles, hiddenTypes);

  const [selected, setSelected] = useState<VehiclePosition | null>(null);

  const routeColor =
    selected?.routeColor ?? getVehicleColor(selected?.vehicleType ?? "UNKNOWN");
  const { data: shapes = [] } = useRouteShapes(selected?.routeId ?? null);

  const handlePointClick = useCallback(
    (feature: GeoJSON.Feature<GeoJSON.Point>) => {
      const props = feature.properties as unknown as VehiclePosition;
      setSelected(props);
    },
    [],
  );

  return (
    <>
      <TransitSymbolLayer data={geojson} onPointClick={handlePointClick} />

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

      {selected && (
        <MapPopup
          longitude={selected.longitude}
          latitude={selected.latitude}
          onClose={() => setSelected(null)}
          offset={15}
          className="w-50"
        >
          <div className="flex min-w-40 flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <div
                className="rounded-sm px-1.5 py-0.5 text-xs font-bold text-white"
                style={{ backgroundColor: routeColor }}
              >
                {selected.routeShortName}
              </div>
              <div className="text-sm font-semibold">
                {selected.label || "Unknown Destination"}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-x-2 gap-y-1">
              <span className="text-secondary">Type</span>
              <span className="truncate">{selected.vehicleType}</span>
              {selected.licensePlate && (
                <>
                  <span className="text-secondary">Plate</span>
                  <span className="truncate">{selected.licensePlate}</span>
                </>
              )}
              <span className="text-secondary">Updated</span>
              <span className="truncate">
                {formatDistanceToNow(selected.lastUpdateTime, {
                  addSuffix: true,
                })}
              </span>
            </div>
          </div>
        </MapPopup>
      )}
    </>
  );
}
