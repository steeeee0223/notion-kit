import type {
  TransitListEntryWithReferencesTransitVehicle,
  TransitRoute,
  TransitRouteVariant,
} from "@/providers/bkk/api";
import { decodePolyline } from "@/providers/bkk/polyline";
import type { RouteShape, VehiclePosition } from "@/providers/types";

export function transferVehiclesForLocation(
  data: TransitListEntryWithReferencesTransitVehicle,
) {
  const vehicles = data.list;
  const routesRef = data.references?.routes ?? {};

  return vehicles.map<VehiclePosition>((v) => {
    const route: Partial<TransitRoute> =
      (v.routeId ? routesRef[v.routeId] : undefined) ?? {};

    // normalize vehicle type
    let vehicleType = v.vehicleRouteType ?? "UNKNOWN";
    if ("type" in route && route.type) {
      vehicleType = route.type;
    }

    return {
      id: v.vehicleId,
      routeId: v.routeId ?? "",
      routeShortName: route.shortName ?? "",
      routeColor: route.color ? `#${route.color}` : "",
      vehicleType: vehicleType as VehiclePosition["vehicleType"],
      longitude: v.location?.lon ?? 0,
      latitude: v.location?.lat ?? 0,
      bearing: v.bearing ?? 0,
      label: v.label ?? "",
      licensePlate: v.licensePlate ?? "",
      lastUpdateTime: (v.lastUpdateTime ?? 0) * 1000,
      stale: v.stale ?? false,
    };
  });
}

export function transferRouteDetailsToShapes(
  routeId: string,
  variants: TransitRouteVariant[],
) {
  return variants.reduce<RouteShape[]>((acc, v, i) => {
    if (!v.polyline.points) return acc;

    acc.push({
      shapeId: v.patternId ?? `${routeId}_variant_${i}`,
      routeId,
      points: decodePolyline(v.polyline.points),
    });
    return acc;
  }, []);
}
