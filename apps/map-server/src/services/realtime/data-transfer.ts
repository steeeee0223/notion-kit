import type { RealtimeSnapshotData } from "@/services/repository";

export interface RtFeedMessage {
  entity?: RtEntity[];
}

interface RtEntity {
  vehicle?: {
    trip?: { tripId?: string; routeId?: string };
    vehicle?: { id?: string; label?: string };
    position?: {
      latitude?: number;
      longitude?: number;
      bearing?: number;
      speed?: number;
    };
    currentStopSequence?: number;
    currentStatus?: unknown;
    occupancyStatus?: unknown;
    timestamp?: number | string | LongLike;
  };
  tripUpdate?: {
    trip?: {
      tripId?: string;
      routeId?: string;
      scheduleRelationship?: unknown;
    };
    stopTimeUpdate?: {
      stopId?: string;
      stopSequence?: number;
      scheduleRelationship?: unknown;
      arrival?: { delay?: number };
      departure?: { delay?: number };
    }[];
  };
  alert?: {
    cause?: unknown;
    effect?: unknown;
    activePeriod?: {
      start?: number | string | LongLike;
      end?: number | string | LongLike;
    }[];
    informedEntity?: {
      routeId?: string;
      stopId?: string;
    }[];
    headerText?: { translation?: { text?: string; language?: string }[] };
    descriptionText?: { translation?: { text?: string; language?: string }[] };
  };
}

interface LongLike {
  toNumber?: () => number;
  toString: () => string;
}

export function buildRealtimeSnapshotData(input: {
  feedOnestopId: string;
  capturedAt: string;
  vehiclePositions: RtFeedMessage | null;
  tripUpdates: RtFeedMessage | null;
  alerts: RtFeedMessage | null;
}): RealtimeSnapshotData {
  return {
    vehiclePositions: input.vehiclePositions
      ? vehicleRowsFromMessage(
          input.feedOnestopId,
          input.vehiclePositions,
          input.capturedAt,
        )
      : [],
    tripUpdates: input.tripUpdates
      ? tripUpdateRowsFromMessage(
          input.feedOnestopId,
          input.tripUpdates,
          input.capturedAt,
        )
      : [],
    alerts: input.alerts
      ? alertRowsFromMessage(
          input.feedOnestopId,
          input.alerts,
          input.capturedAt,
        )
      : [],
  };
}

function vehicleRowsFromMessage(
  feedOnestopId: string,
  message: RtFeedMessage,
  capturedAt: string,
) {
  return (message.entity ?? []).flatMap((entity) => {
    const vehicle = entity.vehicle;
    if (!vehicle?.position?.latitude || !vehicle.position.longitude) return [];
    return [
      {
        feedOnestopId,
        vehicleId: vehicle.vehicle?.id ?? null,
        vehicleLabel: vehicle.vehicle?.label ?? null,
        tripId: vehicle.trip?.tripId
          ? scopedId(feedOnestopId, vehicle.trip.tripId)
          : null,
        routeId: vehicle.trip?.routeId
          ? scopedId(feedOnestopId, vehicle.trip.routeId)
          : null,
        lat: vehicle.position.latitude,
        lon: vehicle.position.longitude,
        bearing: vehicle.position.bearing ?? null,
        speed: vehicle.position.speed ?? null,
        currentStopSequence: vehicle.currentStopSequence ?? null,
        currentStatus: enumName(vehicle.currentStatus),
        occupancyStatus: enumName(vehicle.occupancyStatus),
        vehicleTimestamp: timestampOrNull(vehicle.timestamp),
        capturedAt: new Date(capturedAt),
      },
    ];
  });
}

function tripUpdateRowsFromMessage(
  feedOnestopId: string,
  message: RtFeedMessage,
  capturedAt: string,
) {
  return (message.entity ?? []).flatMap((entity) => {
    const update = entity.tripUpdate;
    if (!update?.trip?.tripId) return [];
    const tripId = scopedId(feedOnestopId, update.trip.tripId);
    const routeId = update.trip.routeId
      ? scopedId(feedOnestopId, update.trip.routeId)
      : null;
    return (update.stopTimeUpdate ?? []).map((stopTime) => ({
      feedOnestopId,
      tripId,
      routeId,
      stopId: stopTime.stopId ? scopedId(feedOnestopId, stopTime.stopId) : null,
      stopSequence: stopTime.stopSequence ?? null,
      arrivalDelay: stopTime.arrival?.delay ?? null,
      departureDelay: stopTime.departure?.delay ?? null,
      scheduleRelationship: enumName(
        stopTime.scheduleRelationship ?? update.trip?.scheduleRelationship,
      ),
      capturedAt: new Date(capturedAt),
    }));
  });
}

function alertRowsFromMessage(
  feedOnestopId: string,
  message: RtFeedMessage,
  capturedAt: string,
) {
  return (message.entity ?? []).flatMap((entity) => {
    const alert = entity.alert;
    if (!alert) return [];
    const affectedRoutes = (alert.informedEntity ?? []).flatMap((entity) =>
      entity.routeId ? [scopedId(feedOnestopId, entity.routeId)] : [],
    );
    const affectedStops = (alert.informedEntity ?? []).flatMap((entity) =>
      entity.stopId ? [scopedId(feedOnestopId, entity.stopId)] : [],
    );
    const firstPeriod = alert.activePeriod?.[0];
    return [
      {
        feedOnestopId,
        cause: enumName(alert.cause),
        effect: enumName(alert.effect),
        headerText: translatedText(alert.headerText),
        descriptionText: translatedText(alert.descriptionText),
        affectedRoutes: affectedRoutes,
        affectedStops: affectedStops,
        alertStart: timestampOrNull(firstPeriod?.start),
        alertEnd: timestampOrNull(firstPeriod?.end),
        capturedAt: new Date(capturedAt),
      },
    ];
  });
}

function translatedText(
  value:
    | {
        translation?: { text?: string; language?: string }[];
      }
    | undefined,
) {
  return (
    value?.translation?.find((translation) => translation.language === "en")
      ?.text ??
    value?.translation?.[0]?.text ??
    null
  );
}

function timestampOrNull(value: number | string | LongLike | undefined) {
  const seconds = longToNumber(value);
  return seconds ? new Date(seconds * 1000) : null;
}

function longToNumber(value: number | string | LongLike | undefined) {
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value);
  if (value?.toNumber) return value.toNumber();
  if (value) return Number(value.toString());
  return null;
}

function enumName(value: unknown) {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  return null;
}

function scopedId(feedOnestopId: string, id: string) {
  const decoded = decodeRepeatedly(id);
  if (decoded.startsWith(`${feedOnestopId}:`)) return decoded;
  return `${feedOnestopId}:${decoded}`;
}

function decodeRepeatedly(value: string) {
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
