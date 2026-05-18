import {
  getActiveServices,
  getAlerts,
  getRoutesByIds,
  getStop,
  getStopTimesByStop,
  getTripsByIds,
  getTripUpdates,
} from "@/services/repository";
import { toAlertResponse, toDepartureResponse } from "@/services/transfer";

export async function buildStopDepartures(input: {
  stopId: string;
  date: string;
  startTime: string;
  endTime: string;
  includeRealtime: boolean;
  includeAlerts: boolean;
  limit: number;
}) {
  const stop = await getStop(input.stopId);
  const activeServices = await getActiveServices(
    stop.feedOnestopId,
    input.date,
  );
  const stopTimes = (
    await getStopTimesByStop(
      stop.id,
      input.startTime,
      input.endTime,
      input.limit,
    )
  ).slice(0, input.limit * 3);
  const tripRows = await getTripsByIds(stopTimes.map((st) => st.tripId));
  const serviceStopTimes = stopTimes
    .filter((st) => {
      const trip = tripRows.get(st.tripId);
      return trip && activeServices.has(trip.serviceId);
    })
    .slice(0, input.limit);
  const serviceTrips = serviceStopTimes.flatMap((st) => {
    const trip = tripRows.get(st.tripId);
    return trip ? [trip] : [];
  });
  const routeRows = await getRoutesByIds(
    serviceTrips.map((trip) => trip.routeId),
  );
  const updates = input.includeRealtime
    ? await getTripUpdates({
        tripIds: serviceTrips.map((trip) => trip.id),
        stopIds: [stop.id],
      })
    : [];
  const updateByTripStop = new Map(
    updates.map((update) => [`${update.tripId}:${update.stopId}`, update]),
  );
  const alerts = input.includeAlerts
    ? await getAlerts({
        feedOnestopIds: [stop.feedOnestopId],
        stopIds: [stop.id],
        routeIds: serviceTrips.map((trip) => trip.routeId),
      })
    : [];
  return {
    stop: {
      id: stop.id,
      stop_name: stop.stopName,
      lat: stop.lat,
      lon: stop.lon,
    },
    departures: serviceStopTimes.flatMap((st) => {
      const trip = tripRows.get(st.tripId);
      if (!trip) return [];
      return [
        toDepartureResponse(
          st,
          trip,
          routeRows.get(trip.routeId),
          input.date,
          updateByTripStop.get(`${trip.id}:${stop.id}`),
        ),
      ];
    }),
    alerts: alerts.map(toAlertResponse),
    realtimeAvailable: input.includeRealtime && updates.length > 0,
  };
}
