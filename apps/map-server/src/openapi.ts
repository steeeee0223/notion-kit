export const examples = {
  bbox: "-122.5,37.6,-121.8,37.9",
  bboxArray: [-122.5, 37.6, -121.8, 37.9],
  feedOnestopId: "f-9q9-bart",
  routeId: "f-9q9-bart:L1",
  stopId: "f-9q9-bart:12TH",
  tripId: "f-9q9-bart:trip-555",
  vehicleId: "1234",
  serviceDate: "2026-05-16",
  startTime: "10:00:00",
  endTime: "11:00:00",
  replayStart: "2026-05-15T08:00:00Z",
  replayEnd: "2026-05-15T08:30:00Z",
  replayTimestamp: "2026-05-15T08:15:00Z",
} as const;

const errorResponse = {
  type: "object",
  properties: {
    error: {
      type: "object",
      properties: {
        code: { type: "string", example: "VALIDATION_ERROR" },
        message: { type: "string", example: "Invalid request data" },
        details: { type: "object", additionalProperties: true },
      },
      required: ["code", "message"],
    },
  },
  required: ["error"],
} as const;

const bboxQuery = {
  type: "string",
  description: "Comma-separated min_lon,min_lat,max_lon,max_lat.",
  example: examples.bbox,
} as const;

const bboxArray = {
  type: "array",
  minItems: 4,
  maxItems: 4,
  items: { type: "number" },
  example: examples.bboxArray,
} as const;

const bboxBody = {
  anyOf: [bboxQuery, bboxArray],
} as const;

const alert = {
  type: "object",
  properties: {
    cause: { type: ["string", "null"], example: "CONSTRUCTION" },
    effect: { type: ["string", "null"], example: "DETOUR" },
    header_text: {
      type: ["string", "null"],
      example: "Weekend service change",
    },
    description_text: { type: ["string", "null"] },
  },
} as const;

const vehicle = {
  type: "object",
  properties: {
    vehicle_id: { type: ["string", "null"], example: examples.vehicleId },
    vehicle_label: { type: ["string", "null"], example: "Bus 22" },
    trip_id: { type: ["string", "null"], example: examples.tripId },
    route_id: { type: ["string", "null"], example: examples.routeId },
    route_short_name: { type: ["string", "null"], example: "L1" },
    route_long_name: {
      type: ["string", "null"],
      example: "Antioch to SFIA/Millbrae",
    },
    route_color: { type: ["string", "null"], example: "#ffff33" },
    route_type: { type: ["integer", "null"], example: 1 },
    lat: { type: "number", example: 37.8032 },
    lon: { type: "number", example: -122.0169 },
    bearing: { type: ["number", "null"], example: 270 },
    speed: { type: ["number", "null"], example: 14.5 },
    current_stop_sequence: { type: ["integer", "null"], example: 8 },
    current_status: { type: ["string", "null"], example: "IN_TRANSIT_TO" },
    occupancy_status: {
      type: ["string", "null"],
      example: "MANY_SEATS_AVAILABLE",
    },
    captured_at: {
      type: ["string", "null"],
      format: "date-time",
      example: "2026-05-16T10:32:05Z",
    },
  },
} as const;

const departure = {
  type: "object",
  properties: {
    trip_id: { type: "string", example: examples.tripId },
    route_id: { type: "string", example: examples.routeId },
    route_short_name: { type: ["string", "null"], example: "L1" },
    route_long_name: {
      type: ["string", "null"],
      example: "Antioch to SFIA/Millbrae",
    },
    route_color: { type: ["string", "null"], example: "#ffff33" },
    route_type: { type: ["integer", "null"], example: 1 },
    trip_headsign: { type: ["string", "null"], example: "Antioch" },
    direction_id: { type: ["integer", "null"], example: 0 },
    stop_sequence: { type: "integer", example: 5 },
    service_date: {
      type: "string",
      format: "date",
      example: examples.serviceDate,
    },
    stop_id: { type: ["string", "null"], example: examples.stopId },
    location_group_id: { type: ["string", "null"] },
    location_id: { type: ["string", "null"] },
    scheduled_arrival: { type: ["string", "null"], example: "10:35:00" },
    scheduled_departure: { type: ["string", "null"], example: "10:35:00" },
    start_pickup_drop_off_window: { type: ["string", "null"] },
    end_pickup_drop_off_window: { type: ["string", "null"] },
    pickup_type: { type: ["integer", "null"], example: 0 },
    drop_off_type: { type: ["integer", "null"], example: 0 },
    continuous_pickup: { type: ["integer", "null"] },
    continuous_drop_off: { type: ["integer", "null"] },
    shape_dist_traveled: { type: ["number", "null"] },
    timepoint: { type: ["integer", "null"], example: 1 },
    pickup_booking_rule_id: { type: ["string", "null"] },
    drop_off_booking_rule_id: { type: ["string", "null"] },
    realtime_arrival_delay: { type: ["integer", "null"], example: 120 },
    realtime_departure_delay: { type: ["integer", "null"], example: 120 },
    estimated_departure: { type: ["string", "null"], example: "10:37:00" },
    schedule_relationship: { type: "string", example: "SCHEDULED" },
    is_realtime: { type: "boolean", example: true },
  },
} as const;

const stopTime = {
  type: "object",
  properties: {
    stop_sequence: { type: "integer", example: 1 },
    stop_id: { type: ["string", "null"], example: "f-9q9-bart:PITT" },
    location_group_id: { type: ["string", "null"] },
    location_id: { type: ["string", "null"] },
    stop_name: { type: ["string", "null"], example: "Pittsburg/Bay Point" },
    lat: { type: ["number", "null"], example: 37.9958 },
    lon: { type: ["number", "null"], example: -121.9448 },
    scheduled_arrival: { type: ["string", "null"], example: "09:00:00" },
    scheduled_departure: { type: ["string", "null"], example: "09:00:00" },
    stop_headsign: { type: ["string", "null"] },
    start_pickup_drop_off_window: { type: ["string", "null"] },
    end_pickup_drop_off_window: { type: ["string", "null"] },
    pickup_type: { type: ["integer", "null"], example: 0 },
    drop_off_type: { type: ["integer", "null"], example: 0 },
    continuous_pickup: { type: ["integer", "null"] },
    continuous_drop_off: { type: ["integer", "null"] },
    shape_dist_traveled: { type: ["number", "null"] },
    timepoint: { type: ["integer", "null"], example: 1 },
    pickup_booking_rule_id: { type: ["string", "null"] },
    drop_off_booking_rule_id: { type: ["string", "null"] },
    realtime_arrival_delay: { type: ["integer", "null"], example: null },
    realtime_departure_delay: { type: ["integer", "null"], example: null },
    estimated_departure: { type: ["string", "null"], example: "09:00:00" },
    schedule_relationship: { type: "string", example: "STATIC" },
    is_timepoint: { type: "boolean", example: true },
    stop_status: { type: "string", example: "UPCOMING" },
  },
} as const;

const route = {
  type: "object",
  properties: {
    id: { type: "string", example: examples.routeId },
    feed_onestop_id: { type: "string", example: examples.feedOnestopId },
    route_id: { type: "string", example: "L1" },
    agency_id: { type: ["string", "null"] },
    route_short_name: { type: ["string", "null"], example: "L1" },
    route_long_name: {
      type: ["string", "null"],
      example: "Antioch to SFIA/Millbrae",
    },
    route_desc: { type: ["string", "null"] },
    route_type: { type: ["integer", "null"], example: 1 },
    route_url: { type: ["string", "null"] },
    route_color: { type: ["string", "null"], example: "ffff33" },
    route_text_color: { type: ["string", "null"], example: "000000" },
    route_sort_order: { type: ["integer", "null"], example: 10 },
    agency_name: { type: ["string", "null"], example: "BART" },
  },
} as const;

const routeTripSummary = {
  type: "object",
  properties: {
    id: { type: "string", example: examples.tripId },
    trip_id: { type: "string", example: "trip-555" },
    route_id: { type: "string", example: examples.routeId },
    service_id: { type: "string", example: "weekday" },
    shape_id: { type: ["string", "null"], example: "shape-L1-0" },
    trip_headsign: { type: ["string", "null"], example: "Antioch" },
    trip_short_name: { type: ["string", "null"] },
    direction_id: { type: ["integer", "null"], example: 0 },
    block_id: { type: ["string", "null"] },
    wheelchair_accessible: { type: ["integer", "null"], example: 1 },
    bikes_allowed: { type: ["integer", "null"] },
    cars_allowed: { type: ["integer", "null"] },
    safe_duration_factor: { type: ["number", "null"] },
    safe_duration_offset: { type: ["integer", "null"] },
    first_departure_time: { type: ["string", "null"], example: "10:05:00" },
    last_departure_time: { type: ["string", "null"], example: "10:55:00" },
    matching_stop_times_count: { type: "integer", example: 12 },
  },
} as const;

const standardErrors = {
  400: { description: "Bad request", ...errorResponse },
  401: { description: "Unauthorized", ...errorResponse },
  404: { description: "Not found", ...errorResponse },
  422: { description: "Validation error", ...errorResponse },
  500: { description: "Internal server error", ...errorResponse },
} as const;

const adminConfigResponse = {
  200: {
    type: "object",
    properties: {
      admin_token: { type: "string", example: "local.secret" },
      credentials: { type: "object", additionalProperties: true },
    },
  },
  ...standardErrors,
} as const;

const adminTokenParams = {
  type: "object",
  required: ["adminToken"],
  properties: {
    adminToken: { type: "string", example: "local.secret" },
  },
} as const;

const providerParams = {
  type: "object",
  required: ["provider"],
  properties: {
    provider: { type: "string", example: "simulator" },
  },
} as const;

interface OpenApiTag {
  name: string;
  description: string;
}

export const openApiTags = [
  { name: "System", description: "Service health and diagnostics." },
  {
    name: "Transport / Transitland",
    description: "Transitland-backed provider-scoped transportation APIs.",
  },
  {
    name: "Transport / Simulator",
    description: "Simulator-backed provider-scoped transportation APIs.",
  },
  { name: "Replay", description: "Historical vehicle replay APIs." },
  {
    name: "Admin / Sync / Transitland",
    description:
      "Transitland provider validation, static sync, and realtime sync.",
  },
  {
    name: "Admin / Sync / Simulator",
    description:
      "Simulator provider validation, static sync, and realtime sync.",
  },
  {
    name: "Admin / Config",
    description: "Shared provider credential configuration.",
  },
  { name: "WebSocket", description: "Live push protocol documentation." },
] satisfies OpenApiTag[];

const baseOpenApi = {
  health: {
    tags: ["System"],
    summary: "Health check",
    response: {
      200: {
        type: "object",
        properties: {
          ok: { type: "boolean", example: true },
          service: { type: "string", example: "@notion-kit/map-server" },
        },
      },
    },
  },
  mapStaticFeedsStatus: {
    tags: ["Map"],
    summary: "Check static GTFS feed status for a viewport",
    description:
      "Read-only static GTFS discovery/status. Does not import GTFS static rows and does not poll GTFS-RT.",
    querystring: {
      type: "object",
      required: ["bbox"],
      properties: {
        bbox: bboxQuery,
      },
    },
    response: {
      200: {
        type: "object",
        properties: {
          candidates: {
            type: "array",
            items: {
              type: "object",
              properties: {
                feed_lookup_key: {
                  type: "string",
                  example: examples.feedOnestopId,
                },
                feed_onestop_id: {
                  type: "string",
                  example: examples.feedOnestopId,
                },
                name: { type: ["string", "null"], example: "BART" },
                spec: { type: ["string", "null"], example: "gtfs" },
                status: {
                  type: "string",
                  enum: ["missing", "current", "stale", "unknown"],
                  example: "current",
                },
                is_strong_match: { type: "boolean", example: true },
                version: {
                  type: "object",
                  properties: {
                    sha1: { type: ["string", "null"], example: "ab5bdc8b" },
                    fetched_at: {
                      type: ["string", "null"],
                      format: "date-time",
                    },
                  },
                },
                local: {
                  type: "object",
                  properties: {
                    exists: { type: "boolean", example: true },
                    sha1: { type: ["string", "null"], example: "ab5bdc8b" },
                    fetched_at: {
                      type: ["string", "null"],
                      format: "date-time",
                    },
                    last_static_sync: {
                      type: ["string", "null"],
                      format: "date-time",
                    },
                    counts: { type: "object", additionalProperties: true },
                  },
                },
              },
            },
          },
          meta: {
            type: "object",
            properties: {
              bbox: bboxArray,
              total: { type: "integer", example: 1 },
            },
          },
        },
      },
      ...standardErrors,
    },
  },
  mapRoutes: {
    tags: ["Map"],
    summary: "List cached routes for a static GTFS feed",
    description:
      "Reads cached GTFS static routes by Feed Onestop ID. Does not import GTFS static rows.",
    querystring: {
      type: "object",
      required: ["feed_onestop_id"],
      properties: {
        feed_onestop_id: { type: "string", example: examples.feedOnestopId },
        route_type: { type: "integer", example: 1 },
        limit: { type: "integer", default: 200, maximum: 500, example: 50 },
      },
    },
    response: {
      200: {
        type: "object",
        properties: {
          routes: { type: "array", items: route },
          meta: {
            type: "object",
            properties: {
              total: { type: "integer", example: 8 },
              feed_onestop_id: {
                type: "string",
                example: examples.feedOnestopId,
              },
              static_feed: { type: "object", additionalProperties: true },
            },
          },
        },
      },
      ...standardErrors,
    },
  },
  mapTrips: {
    tags: ["Map"],
    summary: "List cached trips for a route in a service time range",
    description:
      "Reads cached GTFS static trips by internal route ID. Does not import GTFS static rows. Use this before expanding a trip with /api/trips/:tripId/stop-times.",
    querystring: {
      type: "object",
      required: ["route_id"],
      properties: {
        route_id: { type: "string", example: examples.routeId },
        service_date: {
          type: "string",
          format: "date",
          example: examples.serviceDate,
        },
        start_time: { type: "string", example: examples.startTime },
        end_time: { type: "string", example: examples.endTime },
        direction_id: { type: "integer", example: 0 },
        limit: { type: "integer", default: 100, maximum: 500, example: 50 },
      },
    },
    response: {
      200: {
        type: "object",
        properties: {
          trips: { type: "array", items: routeTripSummary },
          meta: {
            type: "object",
            properties: {
              total: { type: "integer", example: 8 },
              route_id: { type: "string", example: examples.routeId },
              service_date: {
                type: "string",
                example: examples.serviceDate,
              },
              start_time: { type: "string", example: examples.startTime },
              end_time: { type: "string", example: examples.endTime },
            },
          },
        },
      },
      ...standardErrors,
    },
  },
  mapRouteShape: {
    tags: ["Map"],
    summary: "Get representative route geometry for a cached static route",
    description:
      "Reads a route and representative trip shape by internal route ID. Does not import GTFS static rows.",
    querystring: {
      type: "object",
      required: ["route_id"],
      properties: {
        route_id: { type: "string", example: examples.routeId },
        include_shape: { type: "boolean", default: true, example: true },
      },
    },
    response: {
      200: {
        type: "object",
        properties: {
          trip: {
            anyOf: [routeTripSummary, { type: "null" }],
          },
          route,
          shape: {
            type: ["object", "null"],
            properties: {
              shape_id: { type: "string", example: "shape-L1-0" },
              geojson: { type: "object", additionalProperties: true },
              points: { type: "array", items: { type: "object" } },
              generated: { type: "boolean", example: false },
            },
          },
        },
      },
      ...standardErrors,
    },
  },
  mapStops: {
    tags: ["Map"],
    summary: "List stops in a viewport",
    description:
      "Use after static sync. For static layer lists, prefer feed_onestop_id. Ready-to-test query: feed_onestop_id=f-9q9-bart&include_alerts=true&limit=50",
    querystring: {
      type: "object",
      properties: {
        feed_onestop_id: { type: "string", example: examples.feedOnestopId },
        bbox: bboxQuery,
        lat: { type: "number", example: 37.8032 },
        lon: { type: "number", example: -122.0169 },
        radius: {
          type: "integer",
          maximum: 10000,
          example: 1000,
          description:
            "Meters. Alternative to bbox when lat and lon are present.",
        },
        route_type: { type: "integer", example: 1 },
        include_alerts: { type: "boolean", default: false, example: true },
        limit: { type: "integer", default: 200, maximum: 500, example: 50 },
      },
    },
    response: {
      200: {
        type: "object",
        properties: {
          stops: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "string", example: examples.stopId },
                stop_id: { type: "string", example: "12TH" },
                stop_name: {
                  type: ["string", "null"],
                  example: "12th Street / Oakland City Center",
                },
                tts_stop_name: { type: ["string", "null"] },
                stop_desc: { type: ["string", "null"] },
                stop_code: { type: ["string", "null"], example: "BART-12TH" },
                stop_url: { type: ["string", "null"] },
                zone_id: { type: ["string", "null"] },
                parent_stop_id: { type: ["string", "null"] },
                stop_timezone: { type: ["string", "null"] },
                platform_code: { type: ["string", "null"] },
                level_id: { type: ["string", "null"] },
                stop_access: { type: ["integer", "null"] },
                lat: { type: ["number", "null"], example: 37.8032 },
                lon: { type: ["number", "null"], example: -122.0169 },
                location_type: { type: "integer", example: 0 },
                wheelchair_boarding: { type: "integer", example: 1 },
                feed_onestop_id: {
                  type: "string",
                  example: examples.feedOnestopId,
                },
                alerts: { type: "array", items: alert },
              },
            },
          },
          meta: {
            type: "object",
            properties: {
              total: { type: "integer", example: 42 },
              bbox: bboxArray,
              feed_onestop_id: {
                type: "string",
                example: examples.feedOnestopId,
              },
              static_feed: { type: "object", additionalProperties: true },
            },
          },
        },
      },
      ...standardErrors,
    },
  },
  mapVehicles: {
    tags: ["Map"],
    summary: "List latest vehicle snapshots",
    description:
      "HTTP fallback for live vehicle positions. Seed data with POST /api/admin/sync/realtime first.",
    querystring: {
      type: "object",
      properties: {
        bbox: bboxQuery,
        feed_onestop_id: { type: "string", example: examples.feedOnestopId },
        route_type: { type: "integer", example: 1 },
      },
    },
    response: {
      200: {
        type: "object",
        properties: {
          vehicles: { type: "array", items: vehicle },
          meta: {
            type: "object",
            properties: {
              snapshot_age_seconds: { type: "integer", example: 12 },
              snapshot_available: { type: "boolean", example: true },
              message: {
                type: "string",
                example: "No recent vehicle snapshots are available.",
              },
              auto_sync: {
                type: "object",
                properties: {
                  attempted: { type: "boolean", example: true },
                  skipped_reason: {
                    type: "string",
                    enum: ["cooldown", "in_flight"],
                  },
                  polled_count: { type: "integer", example: 3 },
                  vehicle_positions_count: { type: "integer", example: 128 },
                  errors_count: { type: "integer", example: 0 },
                  message: {
                    type: "string",
                    example:
                      "No recent vehicle snapshots were available, so realtime sync was triggered.",
                  },
                },
              },
            },
          },
        },
      },
      ...standardErrors,
    },
  },
  transportRoutes: {
    tags: ["Transport"],
    summary: "List normalized routes for a transport provider",
    params: providerParams,
    querystring: {
      type: "object",
      required: ["feed_onestop_id"],
      properties: {
        feed_onestop_id: { type: "string", example: examples.feedOnestopId },
        route_type: { type: "integer", example: 3 },
        limit: { type: "integer", example: 200 },
      },
    },
    response: {
      200: {
        type: "object",
        properties: {
          routes: { type: "array", items: route },
          meta: { type: "object", additionalProperties: true },
        },
      },
      ...standardErrors,
    },
  },
  transportStops: {
    tags: ["Transport"],
    summary: "List normalized stops for a transport provider",
    params: providerParams,
    querystring: {
      type: "object",
      properties: {
        feed_onestop_id: { type: "string", example: examples.feedOnestopId },
        bbox: bboxQuery,
        include_alerts: { type: "boolean", example: true },
        limit: { type: "integer", example: 200 },
      },
    },
    response: {
      200: {
        type: "object",
        properties: {
          stops: { type: "array", items: { type: "object" } },
          meta: { type: "object", additionalProperties: true },
        },
      },
      ...standardErrors,
    },
  },
  transportVehicles: {
    tags: ["Transport"],
    summary: "List normalized vehicle snapshots for a transport provider",
    params: providerParams,
    querystring: {
      type: "object",
      properties: {
        bbox: bboxQuery,
        feed_onestop_id: { type: "string", example: examples.feedOnestopId },
        route_type: { type: "integer", example: 3 },
      },
    },
    response: {
      200: {
        type: "object",
        properties: {
          vehicles: { type: "array", items: vehicle },
          meta: { type: "object", additionalProperties: true },
        },
      },
      ...standardErrors,
    },
  },
  stopDepartures: {
    tags: ["Stops"],
    summary: "Get departures for a stop",
    description:
      "Ready-to-test path: /api/stops/f-9q9-bart:12TH/departures?date=2026-05-16&start_time=10:00:00&next=3600",
    params: {
      type: "object",
      required: ["stopId"],
      properties: {
        stopId: {
          type: "string",
          example: examples.stopId,
          description:
            "Internal stop id formatted as <feed_onestop_id>:<gtfs_stop_id>.",
        },
      },
    },
    querystring: {
      type: "object",
      properties: {
        date: { type: "string", format: "date", example: examples.serviceDate },
        start_time: { type: "string", example: examples.startTime },
        end_time: { type: "string", example: examples.endTime },
        next: { type: "integer", example: 3600 },
        include_realtime: { type: "boolean", default: true, example: true },
        include_alerts: { type: "boolean", default: true, example: true },
        limit: { type: "integer", default: 30, example: 30 },
      },
    },
    response: {
      200: {
        type: "object",
        properties: {
          stop: {
            type: "object",
            properties: {
              id: { type: "string", example: examples.stopId },
              stop_name: {
                type: "string",
                example: "12th Street / Oakland City Center",
              },
              lat: { type: "number", example: 37.8032 },
              lon: { type: "number", example: -122.0169 },
            },
          },
          departures: { type: "array", items: departure },
          alerts: { type: "array", items: alert },
          meta: {
            type: "object",
            properties: {
              date: { type: "string", example: examples.serviceDate },
              start_time: { type: "string", example: examples.startTime },
              end_time: { type: "string", example: examples.endTime },
              realtime_available: { type: "boolean", example: true },
            },
          },
        },
      },
      ...standardErrors,
    },
  },
  tripRoute: {
    tags: ["Trips"],
    summary: "Get route details for a trip",
    description:
      "Ready-to-test path: /api/trips/f-9q9-bart:trip-555/route?include_shape=true",
    params: {
      type: "object",
      required: ["tripId"],
      properties: {
        tripId: {
          type: "string",
          example: examples.tripId,
          description:
            "Internal trip id formatted as <feed_onestop_id>:<gtfs_trip_id>.",
        },
      },
    },
    querystring: {
      type: "object",
      properties: {
        include_shape: { type: "boolean", default: true, example: true },
      },
    },
    response: {
      200: {
        type: "object",
        properties: {
          trip: {
            type: "object",
            properties: {
              id: { type: "string", example: examples.tripId },
              trip_id: { type: "string", example: "trip-555" },
              route_id: { type: "string", example: examples.routeId },
              service_id: { type: "string", example: "weekday" },
              shape_id: { type: ["string", "null"], example: "shape-L1-0" },
              trip_headsign: { type: ["string", "null"], example: "Antioch" },
              trip_short_name: { type: ["string", "null"] },
              direction_id: { type: ["integer", "null"], example: 0 },
              block_id: { type: ["string", "null"] },
              wheelchair_accessible: { type: ["integer", "null"], example: 1 },
              bikes_allowed: { type: ["integer", "null"] },
              cars_allowed: { type: ["integer", "null"] },
              safe_duration_factor: { type: ["number", "null"] },
              safe_duration_offset: { type: ["integer", "null"] },
            },
          },
          route: {
            type: ["object", "null"],
            properties: {
              id: { type: "string", example: examples.routeId },
              route_id: { type: "string", example: "L1" },
              agency_id: { type: ["string", "null"] },
              route_short_name: { type: ["string", "null"], example: "L1" },
              route_long_name: {
                type: ["string", "null"],
                example: "Antioch to SFIA/Millbrae",
              },
              route_desc: { type: ["string", "null"] },
              route_type: { type: ["integer", "null"], example: 1 },
              route_url: { type: ["string", "null"] },
              route_color: { type: ["string", "null"], example: "#ffff33" },
              route_text_color: {
                type: ["string", "null"],
                example: "#000000",
              },
              route_sort_order: { type: ["integer", "null"] },
              continuous_pickup: { type: ["integer", "null"] },
              continuous_drop_off: { type: ["integer", "null"] },
              network_id: { type: ["string", "null"] },
              cemv_support: { type: ["integer", "null"] },
              agency_name: {
                type: ["string", "null"],
                example: "Bay Area Rapid Transit",
              },
            },
          },
          shape: {
            type: ["object", "null"],
            properties: {
              shape_id: { type: "string", example: "shape-L1-0" },
              geojson: { type: "object", additionalProperties: true },
              points: { type: "array", items: { type: "object" } },
              generated: { type: "boolean", example: false },
            },
          },
          alerts: { type: "array", items: alert },
        },
      },
      ...standardErrors,
    },
  },
  tripStopTimes: {
    tags: ["Trips"],
    summary: "Get all stop times for a trip",
    description:
      "Ready-to-test path: /api/trips/f-9q9-bart:trip-555/stop-times?include_geometry=true",
    params: {
      type: "object",
      required: ["tripId"],
      properties: {
        tripId: { type: "string", example: examples.tripId },
      },
    },
    querystring: {
      type: "object",
      properties: {
        date: { type: "string", format: "date", example: examples.serviceDate },
        include_realtime: { type: "boolean", default: true, example: true },
        include_geometry: { type: "boolean", default: false, example: true },
      },
    },
    response: {
      200: {
        type: "object",
        properties: {
          trip_id: { type: "string", example: examples.tripId },
          route_short_name: { type: ["string", "null"], example: "L1" },
          service_date: { type: "string", example: examples.serviceDate },
          stop_times: { type: "array", items: stopTime },
        },
      },
      ...standardErrors,
    },
  },
  replayVehicles: {
    tags: ["Replay"],
    summary: "Get replay frames for a short time range",
    description:
      "Ready-to-test query: start=2026-05-15T08:00:00Z&end=2026-05-15T08:30:00Z&step=30&bbox=-122.5,37.6,-121.8,37.9&feed_onestop_id=f-9q9-bart",
    querystring: {
      type: "object",
      required: ["start", "end"],
      properties: {
        start: {
          type: "string",
          format: "date-time",
          example: examples.replayStart,
        },
        end: {
          type: "string",
          format: "date-time",
          example: examples.replayEnd,
        },
        step: { type: "integer", default: 30, example: 30 },
        bbox: bboxQuery,
        feed_onestop_id: { type: "string", example: examples.feedOnestopId },
      },
    },
    response: {
      200: {
        type: "object",
        properties: {
          frames: {
            type: "array",
            items: {
              type: "object",
              properties: {
                timestamp: {
                  type: "string",
                  format: "date-time",
                  example: examples.replayStart,
                },
                vehicles: { type: "array", items: vehicle },
              },
            },
          },
          meta: {
            type: "object",
            properties: {
              start: { type: "string", example: examples.replayStart },
              end: { type: "string", example: examples.replayEnd },
              step_seconds: { type: "integer", example: 30 },
              frame_count: { type: "integer", example: 60 },
              vehicle_count_peak: { type: "integer", example: 7 },
            },
          },
        },
      },
      ...standardErrors,
    },
  },
  replaySnapshot: {
    tags: ["Replay"],
    summary: "Get one replay snapshot at a timestamp",
    description:
      "Ready-to-test query: timestamp=2026-05-15T08:15:00Z&vehicle_id=1234&include_stop_times=true&include_route=true",
    querystring: {
      type: "object",
      required: ["timestamp"],
      properties: {
        timestamp: {
          type: "string",
          format: "date-time",
          example: examples.replayTimestamp,
        },
        bbox: bboxQuery,
        feed_onestop_id: { type: "string", example: examples.feedOnestopId },
        trip_id: { type: "string", example: examples.tripId },
        route_id: { type: "string", example: examples.routeId },
        vehicle_id: { type: "string", example: examples.vehicleId },
        include_stop_times: { type: "boolean", default: false, example: true },
        include_route: { type: "boolean", default: false, example: true },
        tolerance_seconds: { type: "integer", default: 60, example: 60 },
      },
    },
    response: {
      200: {
        type: "object",
        properties: {
          timestamp: { type: "string", example: examples.replayTimestamp },
          closest_snapshot_at: {
            type: ["string", "null"],
            format: "date-time",
            example: "2026-05-15T08:14:42Z",
          },
          snapshot_age_seconds: { type: ["integer", "null"], example: 18 },
          vehicles: { type: "array", items: vehicle },
          trip_stop_times: { type: "array", items: stopTime },
          route: { type: "object", additionalProperties: true },
          alerts: { type: "array", items: alert },
          meta: { type: "object", additionalProperties: true },
        },
      },
      ...standardErrors,
    },
  },
  adminStaticSync: {
    tags: ["Admin / Sync"],
    summary: "Discover and import static GTFS data",
    description:
      'Seed test data first with body { "feedIds": ["f-9q9-bart"], "force": false }. If MAP_ADMIN_TOKEN is set, include Authorization: Bearer <token>.',
    security: [{ adminBearer: [] }],
    body: {
      type: "object",
      properties: {
        bbox: bboxBody,
        feedIds: {
          type: "array",
          items: { type: "string" },
          example: [examples.feedOnestopId],
        },
        force: { type: "boolean", default: false, example: false },
      },
      examples: [
        {
          feedIds: [examples.feedOnestopId],
          force: false,
        },
        {
          bbox: examples.bboxArray,
          force: false,
        },
      ],
    },
    response: {
      200: {
        type: "object",
        properties: {
          synced: {
            type: "array",
            items: {
              type: "object",
              properties: {
                feedOnestopId: {
                  type: "string",
                  example: examples.feedOnestopId,
                },
                sha1: { type: ["string", "null"], example: "ab5bdc8b" },
                status: {
                  type: "string",
                  enum: ["imported", "updated", "skipped", "partial", "error"],
                  example: "imported",
                },
                stopsCount: { type: "integer", example: 50 },
                routesCount: { type: "integer", example: 8 },
                tripsCount: { type: "integer", example: 1420 },
                stopTimesCount: { type: "integer", example: 38400 },
                durationMs: { type: "integer", example: 4200 },
                error: {
                  type: "string",
                  example: "Invalid GTFS static feed relationships",
                },
              },
            },
          },
          transitlandApiCallsUsed: { type: "integer", example: 2 },
          errors: {
            type: "array",
            items: {
              type: "object",
              properties: {
                feedOnestopId: {
                  type: "string",
                  example: examples.feedOnestopId,
                },
                message: {
                  type: "string",
                  example: "Invalid GTFS static feed relationships",
                },
              },
              required: ["feedOnestopId", "message"],
            },
          },
        },
      },
      ...standardErrors,
    },
  },
  adminRealtimeSync: {
    tags: ["Admin / Sync"],
    summary: "Poll direct agency GTFS-RT URLs",
    description:
      'Poll realtime feeds by feed ID or discover realtime-capable feeds for a bbox. Body examples: { "feedIds": ["f-9q9-bart"] } or { "bbox": [-122.6, 37.6, -122.2, 37.9] }.',
    security: [{ adminBearer: [] }],
    body: {
      type: "object",
      properties: {
        bbox: bboxBody,
        feedIds: {
          type: "array",
          items: { type: "string" },
          example: [examples.feedOnestopId],
        },
      },
    },
    response: {
      200: {
        type: "object",
        properties: {
          polled: {
            type: "array",
            items: {
              type: "object",
              properties: {
                feedOnestopId: {
                  type: "string",
                  example: examples.feedOnestopId,
                },
                vehiclePositionsCount: { type: "integer", example: 45 },
                tripUpdatesCount: { type: "integer", example: 120 },
                alertsCount: { type: "integer", example: 2 },
                durationMs: { type: "integer", example: 280 },
              },
            },
          },
          errors: { type: "array", items: { type: "object" } },
          meta: {
            type: "object",
            properties: {
              requested_bbox: bboxArray,
              requested_feed_ids: {
                type: "array",
                items: { type: "string" },
              },
              matched_realtime_feed_count: { type: "integer", example: 2 },
              message: { type: "string" },
            },
          },
        },
      },
      ...standardErrors,
    },
  },
  adminRetention: {
    tags: ["Admin / Sync"],
    summary: "Delete expired realtime snapshots and cache rows",
    security: [{ adminBearer: [] }],
    response: {
      200: {
        type: "object",
        properties: {
          ok: { type: "boolean", example: true },
        },
      },
      ...standardErrors,
    },
  },
  adminTransportValidate: {
    tags: ["Admin / Sync"],
    summary: "Validate transport provider configuration",
    security: [{ adminBearer: [] }],
    params: providerParams,
    response: {
      200: {
        type: "object",
        properties: {
          ok: { type: "boolean", example: true },
          message: { type: "string", example: "Missing transit_api_key" },
          credentialKeys: { type: "object", additionalProperties: true },
        },
      },
      ...standardErrors,
    },
  },
  adminConfig: {
    tags: ["Admin / Config"],
    summary: "Read active shared provider config status",
    security: [{ adminBearer: [] }],
    response: adminConfigResponse,
  },
  adminConfigByToken: {
    tags: ["Admin / Config"],
    summary: "Read shared provider config status by admin token",
    security: [{ adminBearer: [] }],
    params: adminTokenParams,
    response: adminConfigResponse,
  },
  adminConfigCredentialsPut: {
    tags: ["Admin / Config"],
    summary: "Replace shared provider credentials for an admin token",
    security: [{ adminBearer: [] }],
    params: adminTokenParams,
    body: {
      type: "object",
      required: ["credentials"],
      properties: {
        credentials: { type: "object", additionalProperties: true },
      },
    },
    response: adminConfigResponse,
  },
  adminConfigCredentialsPatch: {
    tags: ["Admin / Config"],
    summary: "Patch one shared provider credential for an admin token",
    security: [{ adminBearer: [] }],
    params: adminTokenParams,
    body: {
      type: "object",
      required: ["key", "value"],
      properties: {
        key: { type: "string", example: "transit_api_key" },
        value: { type: ["string", "null"], example: "secret-value" },
      },
    },
    response: adminConfigResponse,
  },
  websocket: {
    tags: ["WebSocket"],
    summary:
      "WebSocket endpoint for live vehicles, stop departures, and replay",
    description:
      'Connect to ws://localhost:3002/ws. Example subscribe message: { "type": "subscribe", "channel": "vehicles", "payload": { "bbox": [-122.5,37.6,-121.8,37.9], "feed_onestop_ids": ["f-9q9-bart"] } }',
    querystring: {
      type: "object",
      properties: {
        token: {
          type: "string",
          description: "Optional auth token for future authenticated WS usage.",
        },
      },
    },
  },
} as const;

function withProviderTag<
  T extends {
    readonly params?: {
      readonly properties?: Record<string, unknown>;
      readonly required?: readonly string[];
    };
    readonly summary?: string;
    readonly tags?: readonly string[];
  },
>(provider: string, schema: T) {
  const { params: originalParams, ...rest } = schema;
  let params = undefined;
  if (originalParams) {
    const { provider: _, ...remainingProperties } =
      originalParams.properties ?? {};
    const remainingRequired = (originalParams.required ?? []).filter(
      (r: string) => r !== "provider",
    );
    if (Object.keys(remainingProperties).length > 0) {
      params = {
        ...originalParams,
        required: remainingRequired,
        properties: remainingProperties,
      };
    }
  }
  return {
    ...rest,
    ...(params ? { params } : {}),
    tags: [
      `Transport / ${provider === "transit" ? "Transitland" : "Simulator"}`,
    ],
    summary: `${schema.summary} (${provider === "transit" ? "Transitland" : "Simulator"})`,
  };
}

function withAdminProviderTag<
  T extends {
    readonly params?: {
      readonly properties?: Record<string, unknown>;
      readonly required?: readonly string[];
    };
    readonly summary?: string;
    readonly tags?: readonly string[];
  },
>(provider: string, schema: T) {
  const { params: originalParams, ...rest } = schema;
  let params = undefined;
  if (originalParams) {
    const { provider: _, ...remainingProperties } =
      originalParams.properties ?? {};
    const remainingRequired = (originalParams.required ?? []).filter(
      (r: string) => r !== "provider",
    );
    if (Object.keys(remainingProperties).length > 0) {
      params = {
        ...originalParams,
        required: remainingRequired,
        properties: remainingProperties,
      };
    }
  }
  return {
    ...rest,
    ...(params ? { params } : {}),
    tags: [
      `Admin / Sync / ${provider === "transit" ? "Transitland" : "Simulator"}`,
    ],
    summary: `${schema.summary} (${provider === "transit" ? "Transitland" : "Simulator"})`,
  };
}

const {
  mapStaticFeedsStatus,
  mapRoutes: _mapRoutes,
  mapTrips,
  mapRouteShape,
  mapStops: _mapStops,
  mapVehicles: _mapVehicles,
  transportRoutes,
  transportStops,
  transportVehicles,
  stopDepartures,
  tripRoute,
  tripStopTimes,
  adminStaticSync: _adminStaticSync,
  adminRealtimeSync: _adminRealtimeSync,
  adminTransportValidate: _adminTransportValidate,
  ...remainingBaseOpenApi
} = baseOpenApi;

export const openApi = {
  ...remainingBaseOpenApi,
  transportStaticFeedsStatus: {
    transit: withProviderTag("transit", mapStaticFeedsStatus),
    simulator: withProviderTag("simulator", mapStaticFeedsStatus),
  },
  transportRoutes: {
    transit: withProviderTag("transit", transportRoutes),
    simulator: withProviderTag("simulator", transportRoutes),
  },
  transportStops: {
    transit: withProviderTag("transit", transportStops),
    simulator: withProviderTag("simulator", transportStops),
  },
  transportTrips: {
    transit: withProviderTag("transit", mapTrips),
    simulator: withProviderTag("simulator", mapTrips),
  },
  transportRouteShape: {
    transit: withProviderTag("transit", mapRouteShape),
    simulator: withProviderTag("simulator", mapRouteShape),
  },
  transportStopDepartures: {
    transit: withProviderTag("transit", stopDepartures),
    simulator: withProviderTag("simulator", stopDepartures),
  },
  transportVehicles: {
    transit: withProviderTag("transit", transportVehicles),
    simulator: withProviderTag("simulator", transportVehicles),
  },
  transportTripRoute: {
    transit: withProviderTag("transit", tripRoute),
    simulator: withProviderTag("simulator", tripRoute),
  },
  transportTripStopTimes: {
    transit: withProviderTag("transit", tripStopTimes),
    simulator: withProviderTag("simulator", tripStopTimes),
  },
  adminTransportValidate: {
    transit: withAdminProviderTag(
      "transit",
      baseOpenApi.adminTransportValidate,
    ),
    simulator: withAdminProviderTag(
      "simulator",
      baseOpenApi.adminTransportValidate,
    ),
  },
  adminTransportStaticSync: {
    transit: withAdminProviderTag("transit", baseOpenApi.adminStaticSync),
    simulator: withAdminProviderTag("simulator", baseOpenApi.adminStaticSync),
  },
  adminTransportRealtimeSync: {
    transit: withAdminProviderTag("transit", baseOpenApi.adminRealtimeSync),
    simulator: withAdminProviderTag("simulator", baseOpenApi.adminRealtimeSync),
  },
} as const;
