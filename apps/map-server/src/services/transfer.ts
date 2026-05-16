import type {
  alertSnapshots,
  routes,
  shapes,
  stops,
  stopTimes,
  trips,
  tripUpdateSnapshots,
  vehiclePositionSnapshots,
} from "@/db/schema";
import { addSecondsToGtfsTime } from "@/lib/schemas";

type AlertRow = typeof alertSnapshots.$inferSelect;
type RouteRow = typeof routes.$inferSelect;
type ShapeRow = typeof shapes.$inferSelect;
type StopRow = typeof stops.$inferSelect;
type StopTimeRow = typeof stopTimes.$inferSelect;
type TripRow = typeof trips.$inferSelect;
type TripUpdateRow = typeof tripUpdateSnapshots.$inferSelect;
type VehicleSnapshotRow = typeof vehiclePositionSnapshots.$inferSelect;

export function toAlertResponse(alert: AlertRow) {
  return {
    cause: alert.cause,
    effect: alert.effect,
    header_text: alert.headerText,
    description_text: alert.descriptionText,
  };
}

export function toStopResponse(stop: StopRow, alerts: AlertRow[] = []) {
  return {
    id: stop.id,
    stop_name: stop.stopName,
    stop_code: stop.stopCode,
    lat: stop.lat,
    lon: stop.lon,
    location_type: stop.locationType ?? 0,
    wheelchair_boarding: stop.wheelchairBoarding ?? 0,
    feed_onestop_id: stop.feedOnestopId,
    alerts: alerts.map(toAlertResponse),
  };
}

export function toVehicleResponse(
  vehicle: VehicleSnapshotRow,
  route?: RouteRow,
) {
  return {
    vehicle_id: vehicle.vehicleId,
    vehicle_label: vehicle.vehicleLabel,
    trip_id: vehicle.tripId,
    route_id: vehicle.routeId,
    route_short_name: route?.routeShortName ?? null,
    route_long_name: route?.routeLongName ?? null,
    route_color: route?.routeColor ?? null,
    route_type: route?.routeType ?? null,
    lat: vehicle.lat,
    lon: vehicle.lon,
    bearing: vehicle.bearing,
    speed: vehicle.speed,
    current_stop_sequence: vehicle.currentStopSequence,
    current_status: vehicle.currentStatus,
    occupancy_status: vehicle.occupancyStatus,
    captured_at: vehicle.capturedAt.toISOString(),
  };
}

export function toRouteResponse(route: RouteRow) {
  return {
    id: route.id,
    route_short_name: route.routeShortName,
    route_long_name: route.routeLongName,
    route_type: route.routeType,
    route_color: route.routeColor,
    route_text_color: route.routeTextColor,
    agency_name: route.agencyName,
  };
}

export function toTripResponse(trip: TripRow) {
  return {
    id: trip.id,
    trip_headsign: trip.tripHeadsign,
    direction_id: trip.directionId,
    wheelchair_accessible: trip.wheelchairAccessible,
  };
}

export function toShapeResponse(shape: ShapeRow | null) {
  if (!shape) return null;
  return {
    shape_id: shape.shapeId,
    geojson: shape.geojson,
    generated: shape.generated ?? false,
  };
}

export function toDepartureResponse(
  stopTime: StopTimeRow,
  trip: TripRow,
  route: RouteRow | undefined,
  serviceDate: string,
  tripUpdate?: TripUpdateRow,
) {
  const arrivalDelay = tripUpdate?.arrivalDelay ?? null;
  const departureDelay = tripUpdate?.departureDelay ?? null;
  return {
    trip_id: trip.id,
    route_id: route?.id ?? trip.routeId,
    route_short_name: route?.routeShortName ?? null,
    route_long_name: route?.routeLongName ?? null,
    route_color: route?.routeColor ?? null,
    route_type: route?.routeType ?? null,
    trip_headsign: trip.tripHeadsign,
    direction_id: trip.directionId,
    stop_sequence: stopTime.stopSequence,
    service_date: serviceDate,
    scheduled_arrival: stopTime.arrivalTime,
    scheduled_departure: stopTime.departureTime,
    realtime_arrival_delay: arrivalDelay,
    realtime_departure_delay: departureDelay,
    estimated_departure: addSecondsToGtfsTime(
      stopTime.departureTime,
      departureDelay ?? 0,
    ),
    schedule_relationship:
      tripUpdate?.scheduleRelationship ?? (tripUpdate ? "SCHEDULED" : "STATIC"),
    is_realtime: !!tripUpdate,
  };
}

export function toTripStopTimeResponse(
  stopTime: StopTimeRow,
  stop: StopRow | undefined,
  tripUpdate?: TripUpdateRow,
  includeGeometry = false,
  currentStopSequence?: number | null,
) {
  const departureDelay = tripUpdate?.departureDelay ?? null;
  const status =
    typeof currentStopSequence === "number"
      ? stopTime.stopSequence < currentStopSequence
        ? "PASSED"
        : stopTime.stopSequence === currentStopSequence
          ? "CURRENT"
          : "UPCOMING"
      : undefined;

  return {
    stop_sequence: stopTime.stopSequence,
    stop_id: stopTime.stopId,
    stop_name: stop?.stopName ?? null,
    ...(includeGeometry
      ? { lat: stop?.lat ?? null, lon: stop?.lon ?? null }
      : {}),
    scheduled_arrival: stopTime.arrivalTime,
    scheduled_departure: stopTime.departureTime,
    realtime_arrival_delay: tripUpdate?.arrivalDelay ?? null,
    realtime_departure_delay: departureDelay,
    estimated_departure: addSecondsToGtfsTime(
      stopTime.departureTime,
      departureDelay ?? 0,
    ),
    schedule_relationship:
      tripUpdate?.scheduleRelationship ?? (tripUpdate ? "SCHEDULED" : "STATIC"),
    is_timepoint: !stopTime.interpolated,
    ...(status ? { stop_status: status } : {}),
  };
}
