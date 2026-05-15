import { useCallback, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";

import { MapPopup, useMap, useMapState } from "@notion-kit/map";

import { useActiveVehiclePositions, useAdapterBBoxStore } from "@/adapters";
import type { VehiclePosition } from "@/adapters";

import { useVehicleStore } from "./store";
import { getVehicleColor, useVehicleGeoJSON } from "./use-vehicle-geojson";
import { useVehicleFilter } from "./vehicles-panel";
import { VehiclesSymbolLayer } from "./vehicles-symbol-layer";

export function VehiclesLayer() {
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

  const { data: vehicles = [] } = useActiveVehiclePositions();
  const hiddenTypes = useVehicleFilter((state) => state.hiddenTypes);
  const geojson = useVehicleGeoJSON(vehicles, hiddenTypes);

  const selected = useVehicleStore((state) => state.selectedVehicle);
  const setSelected = useVehicleStore((state) => state.setSelectedVehicle);

  const handlePointClick = useCallback(
    (feature: GeoJSON.Feature<GeoJSON.Point>) => {
      const props = feature.properties as unknown as VehiclePosition;
      setSelected(props);
    },
    [setSelected],
  );

  const routeColor =
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    selected?.routeColor || getVehicleColor(selected?.vehicleType || "UNKNOWN");

  return (
    <>
      <VehiclesSymbolLayer data={geojson} onPointClick={handlePointClick} />

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
              <span className="text-secondary">Plate</span>
              <span className="truncate">{selected.licensePlate}</span>
              <span className="text-secondary">Updated</span>
              <span className="truncate">
                {formatDistanceToNow(selected.lastUpdateTime)}
              </span>
            </div>
          </div>
        </MapPopup>
      )}
    </>
  );
}
