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
    scheduled_arrival: { type: ["string", "null"], example: "10:35:00" },
    scheduled_departure: { type: ["string", "null"], example: "10:35:00" },
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
    stop_id: { type: "string", example: "f-9q9-bart:PITT" },
    stop_name: { type: ["string", "null"], example: "Pittsburg/Bay Point" },
    lat: { type: ["number", "null"], example: 37.9958 },
    lon: { type: ["number", "null"], example: -121.9448 },
    scheduled_arrival: { type: ["string", "null"], example: "09:00:00" },
    scheduled_departure: { type: ["string", "null"], example: "09:00:00" },
    realtime_arrival_delay: { type: ["integer", "null"], example: null },
    realtime_departure_delay: { type: ["integer", "null"], example: null },
    estimated_departure: { type: ["string", "null"], example: "09:00:00" },
    schedule_relationship: { type: "string", example: "STATIC" },
    is_timepoint: { type: "boolean", example: true },
    stop_status: { type: "string", example: "UPCOMING" },
  },
} as const;

const standardErrors = {
  400: { description: "Bad request", ...errorResponse },
  401: { description: "Unauthorized", ...errorResponse },
  404: { description: "Not found", ...errorResponse },
  422: { description: "Validation error", ...errorResponse },
  500: { description: "Internal server error", ...errorResponse },
} as const;

export const openApi = {
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
  mapStops: {
    tags: ["Map"],
    summary: "List stops in a viewport",
    description:
      "Use after static sync. Ready-to-test query: bbox=-122.5,37.6,-121.8,37.9&include_alerts=true&limit=50",
    querystring: {
      type: "object",
      properties: {
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
                stop_name: {
                  type: "string",
                  example: "12th Street / Oakland City Center",
                },
                stop_code: { type: ["string", "null"], example: "BART-12TH" },
                lat: { type: "number", example: 37.8032 },
                lon: { type: "number", example: -122.0169 },
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
            },
          },
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
              trip_headsign: { type: ["string", "null"], example: "Antioch" },
              direction_id: { type: ["integer", "null"], example: 0 },
              wheelchair_accessible: { type: ["integer", "null"], example: 1 },
            },
          },
          route: {
            type: ["object", "null"],
            properties: {
              id: { type: "string", example: examples.routeId },
              route_short_name: { type: ["string", "null"], example: "L1" },
              route_long_name: {
                type: ["string", "null"],
                example: "Antioch to SFIA/Millbrae",
              },
              route_type: { type: ["integer", "null"], example: 1 },
              route_color: { type: ["string", "null"], example: "#ffff33" },
              route_text_color: {
                type: ["string", "null"],
                example: "#000000",
              },
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
        bbox: bboxArray,
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
                status: { type: "string", example: "imported" },
                stopsCount: { type: "integer", example: 50 },
                routesCount: { type: "integer", example: 8 },
                tripsCount: { type: "integer", example: 1420 },
                stopTimesCount: { type: "integer", example: 38400 },
                durationMs: { type: "integer", example: 4200 },
              },
            },
          },
          transitlandApiCallsUsed: { type: "integer", example: 2 },
          errors: { type: "array", items: { type: "object" } },
        },
      },
      ...standardErrors,
    },
  },
  adminRealtimeSync: {
    tags: ["Admin / Sync"],
    summary: "Poll direct agency GTFS-RT URLs",
    description:
      'Run after static sync has stored realtime URLs on feeds. Body example: { "feedIds": ["f-9q9-bart"] }.',
    security: [{ adminBearer: [] }],
    body: {
      type: "object",
      properties: {
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
