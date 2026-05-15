import { useCallback, useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";

import { MapPopup, MapRoute, useMap, useMapState } from "@notion-kit/map";

import { useTransitFilter } from "@/plugins/transitland/transit-panel";
import { TransitSymbolLayer } from "@/plugins/transitland/transit-symbol-layer";
import { useRouteShapes } from "@/plugins/transitland/use-route-shapes";
import {
  getVehicleColor,
  useVehicleGeoJSON,
} from "@/plugins/transitland/use-vehicle-geojson";
import {
  useTransitlandBBoxStore,
  useVehiclePositions,
  type VehiclePosition,
} from "@/plugins/transitland/use-vehicle-positions";

export function TransitLayer() {
  const { map } = useMap();
  const setBBoxAndZoom = useTransitlandBBoxStore(
    (state) => state.setBBoxAndZoom,
  );
  const flyTo = useTransitlandBBoxStore((state) => state.flyTo);
  const clearFlyTo = useTransitlandBBoxStore((state) => state.clearFlyTo);

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

  const { data: vehicles = [] } = useVehiclePositions();
  const hiddenTypes = useTransitFilter((state) => state.hiddenTypes);
  const geojson = useVehicleGeoJSON(vehicles, hiddenTypes);

  const [selected, setSelected] = useState<VehiclePosition | null>(null);

  const routeColor =
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    selected?.routeColor || getVehicleColor(selected?.vehicleType || "UNKNOWN");
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
