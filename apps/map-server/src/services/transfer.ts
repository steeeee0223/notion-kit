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
    stop_id: stop.stopId,
    stop_name: stop.stopName,
    tts_stop_name: stop.ttsStopName,
    stop_desc: stop.stopDesc,
    stop_code: stop.stopCode,
    stop_url: stop.stopUrl,
    zone_id: stop.zoneId,
    parent_stop_id: stop.parentStopId,
    stop_timezone: stop.stopTimezone,
    platform_code: stop.platformCode,
    level_id: stop.levelId,
    stop_access: stop.stopAccess,
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
    feed_onestop_id: route.feedOnestopId,
    route_id: route.routeId,
    agency_id: route.agencyId,
    route_short_name: route.routeShortName,
    route_long_name: route.routeLongName,
    route_desc: route.routeDesc,
    route_type: route.routeType,
    route_url: route.routeUrl,
    route_color: route.routeColor,
    route_text_color: route.routeTextColor,
    route_sort_order: route.routeSortOrder,
    continuous_pickup: route.continuousPickup,
    continuous_drop_off: route.continuousDropOff,
    network_id: route.networkId,
    cemv_support: route.cemvSupport,
    agency_name: route.agencyName,
  };
}

export function toTripResponse(trip: TripRow) {
  return {
    id: trip.id,
    trip_id: trip.tripId,
    route_id: trip.routeId,
    service_id: trip.serviceId,
    shape_id: trip.shapeId,
    trip_headsign: trip.tripHeadsign,
    trip_short_name: trip.tripShortName,
    direction_id: trip.directionId,
    block_id: trip.blockId,
    wheelchair_accessible: trip.wheelchairAccessible,
    bikes_allowed: trip.bikesAllowed,
    cars_allowed: trip.carsAllowed,
    safe_duration_factor: trip.safeDurationFactor,
    safe_duration_offset: trip.safeDurationOffset,
  };
}

export function toShapeResponse(shape: ShapeRow | null) {
  if (!shape) return null;
  return {
    shape_id: shape.shapeId,
    geojson: shape.geojson,
    points: shape.points,
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
    stop_id: stopTime.stopId,
    location_group_id: stopTime.locationGroupId,
    location_id: stopTime.locationId,
    scheduled_arrival: stopTime.arrivalTime,
    scheduled_departure: stopTime.departureTime,
    start_pickup_drop_off_window: stopTime.startPickupDropOffWindow,
    end_pickup_drop_off_window: stopTime.endPickupDropOffWindow,
    pickup_type: stopTime.pickupType,
    drop_off_type: stopTime.dropOffType,
    continuous_pickup: stopTime.continuousPickup,
    continuous_drop_off: stopTime.continuousDropOff,
    shape_dist_traveled: stopTime.shapeDistTraveled,
    timepoint: stopTime.timepoint,
    pickup_booking_rule_id: stopTime.pickupBookingRuleId,
    drop_off_booking_rule_id: stopTime.dropOffBookingRuleId,
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
    location_group_id: stopTime.locationGroupId,
    location_id: stopTime.locationId,
    stop_name: stop?.stopName ?? null,
    ...(includeGeometry
      ? { lat: stop?.lat ?? null, lon: stop?.lon ?? null }
      : {}),
    scheduled_arrival: stopTime.arrivalTime,
    scheduled_departure: stopTime.departureTime,
    stop_headsign: stopTime.stopHeadsign,
    start_pickup_drop_off_window: stopTime.startPickupDropOffWindow,
    end_pickup_drop_off_window: stopTime.endPickupDropOffWindow,
    pickup_type: stopTime.pickupType,
    drop_off_type: stopTime.dropOffType,
    continuous_pickup: stopTime.continuousPickup,
    continuous_drop_off: stopTime.continuousDropOff,
    shape_dist_traveled: stopTime.shapeDistTraveled,
    timepoint: stopTime.timepoint,
    pickup_booking_rule_id: stopTime.pickupBookingRuleId,
    drop_off_booking_rule_id: stopTime.dropOffBookingRuleId,
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
