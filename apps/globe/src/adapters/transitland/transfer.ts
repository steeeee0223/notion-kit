import type { VehicleType } from "@/lib/types";

import type { VehiclePosition } from "./use-vehicle-positions";

export interface MapServerVehicle {
  vehicle_id: string | null;
  vehicle_label: string | null;
  trip_id: string | null;
  route_id: string | null;
  route_short_name: string | null;
  route_long_name: string | null;
  route_color: string | null;
  route_type: number | null;
  lat: number;
  lon: number;
  bearing: number | null;
  speed: number | null;
  current_stop_sequence: number | null;
  current_status: string | null;
  occupancy_status: string | null;
  captured_at: string | null;
}

export function toVehiclePosition(vehicle: MapServerVehicle): VehiclePosition {
  const lastUpdateTime = vehicle.captured_at
    ? Date.parse(vehicle.captured_at)
    : Date.now();
  const tripId = decodeRepeatedly(vehicle.trip_id);
  const routeId = decodeRepeatedly(vehicle.route_id);
  const routeShortName =
    vehicle.route_short_name ??
    getScopedLocalId(routeId) ??
    vehicle.vehicle_label ??
    "";

  return {
    id:
      vehicle.vehicle_id ??
      `${tripId ?? routeId ?? "vehicle"}:${vehicle.lon}:${vehicle.lat}`,
    tripId: hasStaticTripDetails(tripId) ? tripId : null,
    routeId: routeId ?? "",
    routeShortName,
    routeColor: normalizeRouteColor(vehicle.route_color),
    operatorOnestopId: getFeedOnestopId(routeId),
    vehicleType: mapRouteType(vehicle.route_type),
    longitude: vehicle.lon,
    latitude: vehicle.lat,
    bearing: vehicle.bearing ?? 0,
    label:
      vehicle.route_long_name ??
      vehicle.vehicle_label ??
      vehicle.route_short_name ??
      "Unknown Destination",
    licensePlate: vehicle.vehicle_label ?? vehicle.vehicle_id ?? "",
    lastUpdateTime,
    stale: Date.now() - lastUpdateTime > 90_000,
  };
}

export function toVehiclePositions(vehicles: MapServerVehicle[]) {
  return vehicles.map(toVehiclePosition);
}

export function normalizeRouteColor(color: string | null | undefined) {
  if (!color) return "";
  return color.startsWith("#") ? color : `#${color}`;
}

function getFeedOnestopId(routeId: string | null) {
  return routeId?.includes(":") ? routeId.split(":")[0] : undefined;
}

function getScopedLocalId(value: string | null) {
  if (!value) return null;
  return value.includes(":") ? (value.split(":").pop() ?? value) : value;
}

function decodeRepeatedly(value: string | null) {
  if (!value) return null;
  let decoded = value;
  for (let i = 0; i < 3; i += 1) {
    try {
      const next = decodeURIComponent(decoded);
      if (next === decoded) break;
      decoded = next;
    } catch {
      break;
    }
  }
  return decoded;
}

function hasStaticTripDetails(tripId: string | null) {
  if (!tripId) return false;
  const feedOnestopId = tripId.includes(":") ? tripId.split(":")[0] : null;
  if (!feedOnestopId) return true;
  return !feedOnestopId.toLowerCase().includes("~rt");
}

function mapRouteType(routeType: number | null): VehicleType {
  switch (routeType) {
    case 0:
      return "TRAM";
    case 1:
      return "SUBWAY";
    case 2:
      return "RAIL";
    case 3:
      return "BUS";
    case 4:
      return "FERRY";
    case 11:
      return "TROLLEYBUS";
    default:
      return "UNKNOWN";
  }
}
