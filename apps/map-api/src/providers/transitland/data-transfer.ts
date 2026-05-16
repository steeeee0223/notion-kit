import type { VehiclePosition } from "@/providers/types";

// Types for Transitland GTFS-RT JSON format
export interface GTFSRTFeed {
  header: {
    gtfsRealtimeVersion: string;
    incrementality: string;
    timestamp: string;
  };
  entity: GTFSRTEntity[];
}

export interface GTFSRTEntity {
  id: string;
  vehicle?: {
    trip?: {
      tripId?: string;
      routeId?: string;
      directionId?: number;
      startDate?: string;
    };
    vehicle?: {
      id?: string;
      label?: string;
      licensePlate?: string;
    };
    position?: {
      latitude: number;
      longitude: number;
      bearing?: number;
      speed?: number;
    };
    timestamp?: string;
  };
}

export function transferTransitlandVehicles(
  feedData: GTFSRTFeed,
  operatorOnestopId?: string,
): VehiclePosition[] {
  if (feedData.entity.length === 0) return [];

  const now = Date.now();
  const feedTimestamp = feedData.header.timestamp
    ? Number(feedData.header.timestamp) * 1000
    : now;

  return feedData.entity
    .filter((e) => e.vehicle?.position)
    .map<VehiclePosition>((e) => {
      const v = e.vehicle!;
      const pos = v.position!;

      const lastUpdateTime = v.timestamp
        ? Number(v.timestamp) * 1000
        : feedTimestamp;

      return {
        id: v.vehicle?.id ?? e.id,
        routeId: v.trip?.routeId ?? "",
        routeShortName: v.trip?.routeId ?? "", // Realtime feeds often don't include shortName
        routeColor: "", // RT feeds usually don't have color, we'd need static GTFS
        operatorOnestopId: operatorOnestopId ?? "",
        vehicleType: "UNKNOWN", // RT feeds might not have type, we default to UNKNOWN
        longitude: pos.longitude,
        latitude: pos.latitude,
        bearing: pos.bearing ?? 0,
        label: v.vehicle?.label ?? "",
        licensePlate: v.vehicle?.licensePlate ?? "",
        lastUpdateTime,
        stale: now - lastUpdateTime > 15 * 60 * 1000, // 15 mins stale
      };
    });
}
