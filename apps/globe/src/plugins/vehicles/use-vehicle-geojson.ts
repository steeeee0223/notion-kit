import { useMemo } from "react";

import type { VehiclePosition } from "@/adapters";

type VehicleFeature = GeoJSON.Feature<
  GeoJSON.Point,
  VehiclePosition & { _color: string }
>;

export type VehicleFeatureCollection = GeoJSON.FeatureCollection<
  GeoJSON.Point,
  VehiclePosition & { _color: string }
>;

const VEHICLE_TYPE_COLORS: Record<string, string> = {
  BUS: "#337EA9",
  TRAM: "#CB912F",
  TROLLEYBUS: "#D44C47",
  SUBWAY: "#448361",
  RAIL: "#9065B0",
  FERRY: "#D9730D",
  UNKNOWN: "#A6A299",
};

export function getVehicleColor(type: string): string {
  return VEHICLE_TYPE_COLORS[type] ?? VEHICLE_TYPE_COLORS.UNKNOWN!;
}

function vehicleToFeature(v: VehiclePosition): VehicleFeature {
  return {
    type: "Feature",
    geometry: { type: "Point", coordinates: [v.longitude, v.latitude] },
    properties: { ...v, _color: getVehicleColor(v.vehicleType) },
  };
}

export function useVehicleGeoJSON(
  vehicles: VehiclePosition[],
  hiddenTypes: Set<string>,
): VehicleFeatureCollection {
  return useMemo(() => {
    const features: VehicleFeature[] = [];
    for (const v of vehicles) {
      if (v.stale || hiddenTypes.has(v.vehicleType)) continue;
      features.push(vehicleToFeature(v));
    }
    return { type: "FeatureCollection", features } as const;
  }, [vehicles, hiddenTypes]);
}
