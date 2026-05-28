import type { FastifyInstance } from "fastify";

import { sendError } from "@/lib/api-error";
import { openApi } from "@/openapi";
import {
  getAlerts,
  getReplayVehicleRows,
  getRoutesByIds,
  getShape,
  getStopsByIds,
  getStopTimesByTrip,
  getTrip,
  getTripUpdates,
  getVehicleSnapshotAt,
} from "@/services/repository";
import {
  toAlertResponse,
  toTripStopTimeResponse,
  toVehicleResponse,
} from "@/services/transfer";

import { replaySnapshotQuerySchema, replayVehiclesQuerySchema } from "./schema";

export function registerReplayRoutes(app: FastifyInstance) {
  app.get(
    "/api/replay/vehicles",
    { schema: openApi.replayVehicles },
    async (request, reply) => {
      try {
        const query = replayVehiclesQuerySchema.parse(request.query);
        const rows = await getReplayVehicleRows({
          start: query.start,
          end: query.end,
          bbox: query.bbox,
          feedOnestopId: query.feed_onestop_id,
        });
        const routeMap = await getRoutesByIds(
          rows.flatMap((row) => (row.routeId ? [row.routeId] : [])),
        );
        const frameMap = new Map<string, typeof rows>();
        for (const row of rows) {
          const frameTs = binTimestamp(
            row.capturedAt.toISOString(),
            query.step,
          );
          const frameRows = frameMap.get(frameTs) ?? [];
          frameRows.push(row);
          frameMap.set(frameTs, frameRows);
        }
        const frames = [...frameMap.entries()].map(([timestamp, frameRows]) => {
          const latestByVehicle = new Map<string, (typeof frameRows)[number]>();
          for (const row of frameRows.sort(
            (a, b) => b.capturedAt.getTime() - a.capturedAt.getTime(),
          )) {
            const key = row.vehicleId ?? `${row.tripId ?? "unknown"}:${row.id}`;
            if (!latestByVehicle.has(key)) latestByVehicle.set(key, row);
          }
          return {
            timestamp,
            vehicles: [...latestByVehicle.values()].map((vehicle) =>
              toVehicleResponse(
                vehicle,
                vehicle.routeId ? routeMap.get(vehicle.routeId) : undefined,
              ),
            ),
          };
        });
        return reply.send({
          frames,
          meta: {
            start: query.start,
            end: query.end,
            step_seconds: query.step,
            frame_count: frames.length,
            vehicle_count_peak: frames.reduce(
              (max, frame) => Math.max(max, frame.vehicles.length),
              0,
            ),
          },
        });
      } catch (error) {
        return sendError(reply, error);
      }
    },
  );

  app.get(
    "/api/replay/snapshot",
    { schema: openApi.replaySnapshot },
    async (request, reply) => {
      try {
        const query = replaySnapshotQuerySchema.parse(request.query);
        const vehicles = await getVehicleSnapshotAt({
          timestamp: query.timestamp,
          toleranceSeconds: query.tolerance_seconds,
          bbox: query.bbox,
          feedOnestopId: query.feed_onestop_id,
          routeId: query.route_id,
          tripId: query.trip_id,
          vehicleId: query.vehicle_id,
        });
        const routeMap = await getRoutesByIds(
          vehicles.flatMap((vehicle) =>
            vehicle.routeId ? [vehicle.routeId] : [],
          ),
        );
        const closestSnapshotAt = vehicles[0]?.capturedAt.toISOString() ?? null;
        const focusTripId = query.trip_id ?? vehicles[0]?.tripId ?? undefined;
        const trip = focusTripId ? await getTrip(focusTripId) : null;
        const tripStopTimes =
          query.include_stop_times && trip
            ? await buildTripStopTimes(
                trip.id,
                vehicles[0]?.currentStopSequence,
              )
            : undefined;
        const routeShape =
          query.include_route && trip?.shapeId
            ? await getShape(trip.shapeId)
            : null;
        const alerts = await getAlerts({
          feedOnestopIds: query.feed_onestop_id
            ? [query.feed_onestop_id]
            : undefined,
          routeIds: query.route_id ? [query.route_id] : undefined,
          timestamp: query.timestamp,
        });
        return reply.send({
          timestamp: query.timestamp,
          closest_snapshot_at: closestSnapshotAt,
          snapshot_age_seconds: closestSnapshotAt
            ? Math.abs(
                Math.floor(
                  (Date.parse(query.timestamp) -
                    Date.parse(closestSnapshotAt)) /
                    1000,
                ),
              )
            : null,
          vehicles: vehicles.map((vehicle) =>
            toVehicleResponse(
              vehicle,
              vehicle.routeId ? routeMap.get(vehicle.routeId) : undefined,
            ),
          ),
          ...(tripStopTimes ? { trip_stop_times: tripStopTimes } : {}),
          ...(routeShape && trip
            ? {
                route: {
                  route_id: trip.routeId,
                  route_short_name:
                    routeMap.get(trip.routeId)?.routeShortName ?? null,
                  route_color: routeMap.get(trip.routeId)?.routeColor ?? null,
                  shape: { geojson: routeShape.geojson },
                },
              }
            : {}),
          alerts: alerts.map(toAlertResponse),
          meta: {
            vehicle_count: vehicles.length,
            filters_applied: {
              trip_id: query.trip_id,
              route_id: query.route_id,
              vehicle_id: query.vehicle_id,
              include_stop_times: query.include_stop_times,
              include_route: query.include_route,
            },
          },
        });
      } catch (error) {
        return sendError(reply, error);
      }
    },
  );
}

async function buildTripStopTimes(
  tripId: string,
  currentStopSequence?: number | null,
) {
  const stopTimeRows = await getStopTimesByTrip(tripId);
  const stopMap = await getStopsByIds(
    stopTimeRows.flatMap((st) => (st.stopId ? [st.stopId] : [])),
  );
  const updates = await getTripUpdates({ tripIds: [tripId] });
  const updateByStop = new Map(
    updates.map((update) => [update.stopId ?? "", update]),
  );
  return stopTimeRows.map((st) =>
    toTripStopTimeResponse(
      st,
      st.stopId ? stopMap.get(st.stopId) : undefined,
      updateByStop.get(st.stopId ?? ""),
      true,
      currentStopSequence,
    ),
  );
}

function binTimestamp(timestamp: string, stepSeconds: number) {
  const stepMs = stepSeconds * 1000;
  return new Date(
    Math.floor(Date.parse(timestamp) / stepMs) * stepMs,
  ).toISOString();
}
