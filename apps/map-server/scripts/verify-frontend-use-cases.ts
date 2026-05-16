import { and, eq, inArray } from "drizzle-orm";

import { db } from "../src/db/index.ts";
import {
  alertSnapshots,
  calendar,
  cache,
  feeds,
  routes,
  stops,
  stopTimes,
  trips,
  tripUpdateSnapshots,
  vehiclePositionSnapshots,
} from "../src/db/schema.ts";
import { getActiveServices } from "../src/services/repository.ts";

interface Summary {
  name: string;
  ok: boolean;
  status?: number;
  details?: unknown;
}

const baseUrl = process.env.MAP_VERIFY_BASE_URL ?? "http://127.0.0.1:3002";
const keepSeed = process.argv.includes("--keep-seed");
const runId = `codex-verify-${Date.now()}`;

const summaries: Summary[] = [];

try {
  const seed = await seedRealtimeRows(runId);
  try {
    await clearVerificationCache(seed);
    await verifyRest(seed);
    await verifyWebSocket(seed);
  } finally {
    if (!keepSeed) await cleanupSeed(seed);
  }

  console.log(JSON.stringify({ baseUrl, keepSeed, runId, summaries }, null, 2));
  const failed = summaries.filter((summary) => !summary.ok);
  if (failed.length > 0) process.exitCode = 1;
} catch (error) {
  console.error(error);
  process.exitCode = 1;
}

async function seedRealtimeRows(runId: string) {
  const [feed] = await db.select().from(feeds).limit(1);
  if (!feed) throw new Error("No feed rows found. Run static sync first.");

  const candidate = await findDepartureCandidate(feed.onestopId);
  const { route, trip, serviceDate, tripStopTimes } = candidate;

  const stopIds = tripStopTimes.map((row) => row.stopId);
  const stopRows = await db.select().from(stops).where(inArray(stops.id, stopIds));
  const stopById = new Map(stopRows.map((stop) => [stop.id, stop]));
  const firstStop = stopById.get(tripStopTimes[0].stopId);
  const secondStop = stopById.get(tripStopTimes[1].stopId);
  if (!firstStop || !secondStop) {
    throw new Error(`Could not resolve stops for trip ${trip.id}`);
  }

  const now = new Date();
  const capturedA = new Date(now.getTime() - 90_000);
  const capturedB = new Date(now.getTime() - 45_000);
  const capturedC = new Date(now.getTime() - 5_000);
  const vehicleId = `${runId}-vehicle`;
  const vehicleLabel = `Verify ${runId}`;
  const alertHeader = `${runId} synthetic service advisory`;

  await db.insert(vehiclePositionSnapshots).values([
    {
      feedOnestopId: feed.onestopId,
      vehicleId,
      vehicleLabel,
      tripId: trip.id,
      routeId: route.id,
      lat: firstStop.lat,
      lon: firstStop.lon,
      bearing: 180,
      speed: 25,
      currentStopSequence: tripStopTimes[0].stopSequence,
      currentStatus: "STOPPED_AT",
      occupancyStatus: "MANY_SEATS_AVAILABLE",
      vehicleTimestamp: capturedA,
      capturedAt: capturedA,
    },
    {
      feedOnestopId: feed.onestopId,
      vehicleId,
      vehicleLabel,
      tripId: trip.id,
      routeId: route.id,
      lat: midpoint(firstStop.lat, secondStop.lat),
      lon: midpoint(firstStop.lon, secondStop.lon),
      bearing: 190,
      speed: 33,
      currentStopSequence: tripStopTimes[1].stopSequence,
      currentStatus: "IN_TRANSIT_TO",
      occupancyStatus: "MANY_SEATS_AVAILABLE",
      vehicleTimestamp: capturedB,
      capturedAt: capturedB,
    },
    {
      feedOnestopId: feed.onestopId,
      vehicleId,
      vehicleLabel,
      tripId: trip.id,
      routeId: route.id,
      lat: secondStop.lat,
      lon: secondStop.lon,
      bearing: 200,
      speed: 0,
      currentStopSequence: tripStopTimes[1].stopSequence,
      currentStatus: "STOPPED_AT",
      occupancyStatus: "MANY_SEATS_AVAILABLE",
      vehicleTimestamp: capturedC,
      capturedAt: capturedC,
    },
  ]);

  await db.insert(tripUpdateSnapshots).values({
    feedOnestopId: feed.onestopId,
    tripId: trip.id,
    routeId: route.id,
    stopId: tripStopTimes[1].stopId,
    stopSequence: tripStopTimes[1].stopSequence,
    arrivalDelay: 120,
    departureDelay: 120,
    scheduleRelationship: "SCHEDULED",
    capturedAt: capturedC,
  });

  await db.insert(alertSnapshots).values({
    feedOnestopId: feed.onestopId,
    cause: "OTHER_CAUSE",
    effect: "OTHER_EFFECT",
    headerText: alertHeader,
    descriptionText: "Synthetic alert inserted by verify:frontend.",
    affectedRoutes: [route.id],
    affectedStops: [tripStopTimes[1].stopId],
    alertStart: new Date(now.getTime() - 60 * 60 * 1000),
    alertEnd: new Date(now.getTime() + 60 * 60 * 1000),
    capturedAt: capturedC,
  });

  return {
    runId,
    feedId: feed.onestopId,
    routeId: route.id,
    routeType: route.routeType,
    tripId: trip.id,
    stopId: tripStopTimes[1].stopId,
    serviceDate,
    startTime: tripStopTimes[1].departureTime ?? "00:00:00",
    endTime: tripStopTimes[1].departureTime ?? "00:00:00",
    vehicleId,
    alertHeader,
    capturedA,
    capturedB,
    capturedC,
    bbox: expandBbox([
      Math.min(firstStop.lon, secondStop.lon),
      Math.min(firstStop.lat, secondStop.lat),
      Math.max(firstStop.lon, secondStop.lon),
      Math.max(firstStop.lat, secondStop.lat),
    ]),
  };
}

async function findDepartureCandidate(feedOnestopId: string) {
  const candidateTrips = await db
    .select()
    .from(trips)
    .where(eq(trips.feedOnestopId, feedOnestopId))
    .limit(200);

  for (const trip of candidateTrips) {
    const serviceDate = await resolveServiceDate(trip);
    const activeServices = await getActiveServices(feedOnestopId, serviceDate);
    if (!activeServices.has(trip.serviceId)) continue;

    const tripStopTimes = await db
      .select()
      .from(stopTimes)
      .where(eq(stopTimes.tripId, trip.id))
      .orderBy(stopTimes.stopSequence)
      .limit(3);
    if (tripStopTimes.length < 2 || !tripStopTimes[1].departureTime) continue;

    const [route] = await db
      .select()
      .from(routes)
      .where(eq(routes.id, trip.routeId))
      .limit(1);
    if (!route) continue;

    return { route, trip, serviceDate, tripStopTimes };
  }

  throw new Error(`No active trip candidate found for ${feedOnestopId}`);
}

async function verifyRest(seed: Awaited<ReturnType<typeof seedRealtimeRows>>) {
  await restCheck("health", "/api/health", (body) => body.ok === true);

  await restCheck(
    "live vehicles",
    `/api/map/vehicles?bbox=${seed.bbox.join(",")}&feed_onestop_id=${encodeURIComponent(seed.feedId)}`,
    (body) =>
      Array.isArray(body.vehicles) &&
      body.vehicles.some((vehicle: Record<string, unknown>) => vehicle.vehicle_id === seed.vehicleId),
  );

  await restCheck(
    "stop departures with realtime delay",
    `/api/stops/${encodeURIComponent(seed.stopId)}/departures?date=${seed.serviceDate}&start_time=${seed.startTime}&end_time=${seed.endTime}&include_realtime=true&limit=10`,
    (body) =>
      Array.isArray(body.departures) &&
      body.departures.some(
        (departure: Record<string, unknown>) =>
          departure.trip_id === seed.tripId &&
          departure.is_realtime === true &&
          departure.realtime_departure_delay === 120,
      ),
  );

  await restCheck(
    "trip stop-times with realtime delay",
    `/api/trips/${encodeURIComponent(seed.tripId)}/stop-times?date=${seed.serviceDate}&include_realtime=true&include_geometry=true`,
    (body) =>
      Array.isArray(body.stop_times) &&
      body.stop_times.some(
        (stopTime: Record<string, unknown>) =>
          stopTime.stop_id === seed.stopId &&
          stopTime.realtime_departure_delay === 120,
      ),
  );

  await restCheck(
    "replay frames",
    `/api/replay/vehicles?start=${encodeURIComponent(seed.capturedA.toISOString())}&end=${encodeURIComponent(new Date(seed.capturedC.getTime() + 10_000).toISOString())}&step=30&bbox=${seed.bbox.join(",")}&feed_onestop_id=${encodeURIComponent(seed.feedId)}`,
    (body) =>
      Array.isArray(body.frames) &&
      body.frames.some((frame: Record<string, unknown>) =>
        Array.isArray(frame.vehicles) &&
        frame.vehicles.some(
          (vehicle: Record<string, unknown>) => vehicle.vehicle_id === seed.vehicleId,
        ),
      ),
  );

  await restCheck(
    "replay snapshot details",
    `/api/replay/snapshot?timestamp=${encodeURIComponent(seed.capturedC.toISOString())}&vehicle_id=${encodeURIComponent(seed.vehicleId)}&include_stop_times=true&tolerance_seconds=120`,
    (body) =>
      Array.isArray(body.vehicles) &&
      body.vehicles.length === 1 &&
      body.vehicles[0].vehicle_id === seed.vehicleId &&
      Array.isArray(body.trip_stop_times) &&
      body.trip_stop_times.some(
        (stopTime: Record<string, unknown>) =>
          stopTime.stop_id === seed.stopId &&
          stopTime.stop_status === "CURRENT",
      ),
  );
}

async function verifyWebSocket(seed: Awaited<ReturnType<typeof seedRealtimeRows>>) {
  const vehicleMessages = await wsExchange({
    type: "subscribe",
    channel: "vehicles",
    id: `${seed.runId}-ws-vehicles`,
    payload: {
      bbox: seed.bbox,
      feed_onestop_ids: [seed.feedId],
      route_type: seed.routeType,
    },
  });
  addSummary("ws vehicles", vehicleMessages.some(
    (message) =>
      message.type === "data" &&
      Array.isArray(message.payload?.vehicles) &&
      message.payload.vehicles.some(
        (vehicle: Record<string, unknown>) => vehicle.vehicle_id === seed.vehicleId,
      ),
  ), vehicleMessages);

  const departureMessages = await wsExchange({
    type: "subscribe",
    channel: "stop:departures",
    id: `${seed.runId}-ws-departures`,
    payload: { stop_id: seed.stopId, window_minutes: 180 },
  });
  addSummary(
    "ws stop departures envelope",
    departureMessages.some(
      (message) =>
        message.type === "data" &&
        message.channel === "stop:departures" &&
        message.payload?.stop_id === seed.stopId &&
        Array.isArray(message.payload.departures),
    ),
    departureMessages,
  );

  const replayMessages = await wsExchange({
    type: "subscribe",
    channel: "replay",
    id: `${seed.runId}-ws-replay`,
    payload: {
      start: seed.capturedA.toISOString(),
      end: new Date(seed.capturedC.getTime() + 10_000).toISOString(),
      speed: 60,
      bbox: seed.bbox,
      feed_onestop_ids: [seed.feedId],
    },
  });
  addSummary("ws replay", replayMessages.some(
    (message) =>
      message.type === "data" &&
      Array.isArray(message.payload?.vehicles) &&
      message.payload.vehicles.some(
        (vehicle: Record<string, unknown>) => vehicle.vehicle_id === seed.vehicleId,
      ),
  ), replayMessages);
}

async function restCheck(
  name: string,
  path: string,
  predicate: (body: Record<string, any>) => boolean,
) {
  const response = await fetch(`${baseUrl}${path}`);
  const body = (await response.json()) as Record<string, any>;
  addSummary(name, response.ok && predicate(body), {
    status: response.status,
    body: summarizeBody(body),
  });
}

async function wsExchange(message: Record<string, unknown>) {
  const wsUrl = baseUrl.replace(/^http/, "ws") + "/ws";
  const WebSocketCtor = globalThis.WebSocket;
  if (!WebSocketCtor) throw new Error("This Node.js runtime has no global WebSocket");

  return await new Promise<Record<string, any>[]>((resolve, reject) => {
    const socket = new WebSocketCtor(wsUrl);
    const messages: Record<string, any>[] = [];
    const timer = setTimeout(() => {
      socket.close();
      resolve(messages);
    }, 1500);

    socket.addEventListener("open", () => {
      socket.send(JSON.stringify(message));
    });
    socket.addEventListener("message", (event) => {
      messages.push(JSON.parse(String(event.data)) as Record<string, any>);
    });
    socket.addEventListener("error", () => {
      clearTimeout(timer);
      reject(new Error(`WebSocket failed for ${wsUrl}`));
    });
    socket.addEventListener("close", () => {
      clearTimeout(timer);
      resolve(messages);
    });
  });
}

async function cleanupSeed(seed: Awaited<ReturnType<typeof seedRealtimeRows>>) {
  await db
    .delete(vehiclePositionSnapshots)
    .where(eq(vehiclePositionSnapshots.vehicleId, seed.vehicleId));
  await db
    .delete(alertSnapshots)
    .where(eq(alertSnapshots.headerText, seed.alertHeader));
  await db
    .delete(tripUpdateSnapshots)
    .where(
      and(
        eq(tripUpdateSnapshots.tripId, seed.tripId),
        eq(tripUpdateSnapshots.stopId, seed.stopId),
        eq(tripUpdateSnapshots.capturedAt, seed.capturedC),
      ),
    );
  await clearVerificationCache(seed);
}

async function clearVerificationCache(seed: Awaited<ReturnType<typeof seedRealtimeRows>>) {
  await db.delete(cache).where(
    inArray(cache.key, [
      `departures:${seed.stopId}:${seed.serviceDate}:${seed.startTime}:rt`,
      `trip:${seed.tripId}:stoptimes:${seed.serviceDate}:true:true`,
    ]),
  );
}

async function resolveServiceDate(trip: typeof trips.$inferSelect) {
  const match = trip.tripId.match(/\d{4}-\d{2}-\d{2}/);
  if (match) return match[0];

  const [calendarRow] = await db
    .select()
    .from(calendar)
    .where(
      and(
        eq(calendar.feedOnestopId, trip.feedOnestopId),
        eq(calendar.serviceId, trip.serviceId),
      ),
    )
    .limit(1);
  if (calendarRow?.startDate) return calendarRow.startDate;
  return new Date().toISOString().slice(0, 10);
}

function addSummary(name: string, ok: boolean, details?: unknown) {
  summaries.push({ name, ok, details });
}

function summarizeBody(body: Record<string, any>) {
  return {
    stops: Array.isArray(body.stops) ? body.stops.length : undefined,
    vehicles: Array.isArray(body.vehicles) ? body.vehicles.length : undefined,
    departures: Array.isArray(body.departures) ? body.departures.length : undefined,
    stop_times: Array.isArray(body.stop_times) ? body.stop_times.length : undefined,
    frames: Array.isArray(body.frames) ? body.frames.length : undefined,
    vehicle_count: body.meta?.vehicle_count,
    realtime_available: body.meta?.realtime_available,
    firstVehicle: body.vehicles?.[0],
    firstDeparture: body.departures?.[0],
    firstFrame: body.frames?.[0],
    error: body.error,
  };
}

function midpoint(a: number, b: number) {
  return (a + b) / 2;
}

function expandBbox([minLon, minLat, maxLon, maxLat]: number[]) {
  const padding = 0.05;
  return [minLon - padding, minLat - padding, maxLon + padding, maxLat + padding];
}
