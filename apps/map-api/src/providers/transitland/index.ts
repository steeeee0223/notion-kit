import type { FastifyPluginAsync } from "fastify";

import type {
  TransitlandFeedsResponse,
  TransitlandOperatorsResponse,
  TransitlandRoutesGeoJSONResponse,
  TransitlandRoutesResponse,
  TransitlandStopsResponse,
} from "@/providers/transitland/api";
import { fetchTransitland } from "@/providers/transitland/client";
import {
  type GTFSRTFeed,
  transferTransitlandVehicles,
} from "@/providers/transitland/data-transfer";
import type { RouteShape } from "@/providers/types";

// eslint-disable-next-line @typescript-eslint/require-await
export const transitlandPlugin: FastifyPluginAsync = async (app) => {
  app.get<{ Querystring: { limit?: number; after?: number } }>(
    "/api/transit/transitland/operators",
    {
      schema: {
        description: "Get Transitland operators",
        tags: ["Transitland"],
        querystring: {
          type: "object",
          properties: {
            limit: { type: "number", default: 10 },
            after: { type: "number" },
          },
        },
      },
    },
    async (req) => {
      const { limit, after } = req.query;

      try {
        const params: Record<string, string | number> = {
          limit: limit ?? 10,
        };
        if (after) {
          params.after = after;
        }

        const data = await fetchTransitland<TransitlandOperatorsResponse>(
          "/operators",
          params,
        );
        return data ?? { operators: [], meta: { after: 0, next: "" } };
      } catch (err) {
        app.log.error(err, "Failed to fetch operators");
        return { operators: [], meta: { after: 0, next: "" } };
      }
    },
  );

  app.get<{
    Querystring: {
      limit?: number;
      after?: number;
      include_geometry?: boolean;
      operator_onestop_id?: string;
    };
  }>(
    "/api/transit/transitland/routes",
    {
      schema: {
        description: "Get Transitland routes",
        tags: ["Transitland"],
        querystring: {
          type: "object",
          properties: {
            limit: { type: "number", default: 10 },
            after: { type: "number" },
            include_geometry: { type: "boolean", default: true },
            operator_onestop_id: { type: "string" },
          },
        },
      },
    },
    async (req) => {
      const { limit, after, include_geometry, operator_onestop_id } = req.query;

      try {
        const params: Record<string, string | number | boolean> = {
          limit: limit ?? 10,
          include_geometry: include_geometry ?? true,
        };
        if (after) {
          params.after = after;
        }
        if (operator_onestop_id) {
          params.operator_onestop_id = operator_onestop_id;
        }

        const data = await fetchTransitland<TransitlandRoutesResponse>(
          "/routes",
          params,
        );
        return data ?? { routes: [], meta: { after: 0, next: "" } };
      } catch (err) {
        app.log.error(err, "Failed to fetch routes");
        return { routes: [], meta: { after: 0, next: "" } };
      }
    },
  );

  app.get<{ Querystring: { limit?: number; after?: number } }>(
    "/api/transit/transitland/feeds",
    {
      schema: {
        description: "Get Transitland feeds",
        tags: ["Transitland"],
        querystring: {
          type: "object",
          properties: {
            limit: { type: "number", default: 10 },
            after: { type: "number" },
          },
        },
      },
    },
    async (req) => {
      const { limit, after } = req.query;

      try {
        const params: Record<string, string | number> = {
          limit: limit ?? 10,
        };
        if (after) {
          params.after = after;
        }

        const data = await fetchTransitland<TransitlandFeedsResponse>(
          "/feeds",
          params,
        );
        return data ?? { feeds: [], meta: { after: 0, next: "" } };
      } catch (err) {
        app.log.error(err, "Failed to fetch feeds");
        return { feeds: [], meta: { after: 0, next: "" } };
      }
    },
  );

  app.get<{
    Querystring: {
      bbox: string;
      limit?: number;
      route_type?: string;
    };
  }>(
    "/api/transit/transitland/routes/geojson",
    {
      schema: {
        description:
          "Get Transitland routes as GeoJSON within a bounding box. bbox format: west,south,east,north",
        tags: ["Transitland"],
        querystring: {
          type: "object",
          properties: {
            bbox: { type: "string" },
            limit: { type: "number", default: 50 },
            route_type: { type: "string" },
          },
          required: ["bbox"],
        },
      },
    },
    async (req) => {
      const { bbox, limit, route_type } = req.query;

      try {
        const params: Record<string, string | number | boolean> = {
          bbox,
          limit: limit ?? 50,
          include_geometry: true,
          format: "geojson",
        };
        if (route_type) {
          params.route_type = route_type;
        }

        const data = await fetchTransitland<TransitlandRoutesGeoJSONResponse>(
          "/routes.geojson",
          params,
        );
        return data ?? { type: "FeatureCollection", features: [] };
      } catch (err) {
        app.log.error(err, "Failed to fetch routes geojson");
        return { type: "FeatureCollection", features: [] };
      }
    },
  );

  app.get<{
    Querystring: {
      lat: number;
      lon: number;
      radius?: number;
      limit?: number;
    };
  }>(
    "/api/transit/transitland/stops",
    {
      schema: {
        description:
          "Get Transitland stops near a geographic point (max radius 10km)",
        tags: ["Transitland"],
        querystring: {
          type: "object",
          properties: {
            lat: { type: "number" },
            lon: { type: "number" },
            radius: { type: "number", default: 5000 },
            limit: { type: "number", default: 50 },
          },
          required: ["lat", "lon"],
        },
      },
    },
    async (req) => {
      const { lat, lon, radius, limit } = req.query;

      try {
        const params: Record<string, string | number> = {
          lat,
          lon,
          radius: radius ?? 5000,
          limit: limit ?? 50,
        };

        const data = await fetchTransitland<TransitlandStopsResponse>(
          "/stops",
          params,
        );
        return data ?? { stops: [], meta: { after: 0, next: "" } };
      } catch (err) {
        app.log.error(err, "Failed to fetch stops");
        return { stops: [], meta: { after: 0, next: "" } };
      }
    },
  );

  app.get<{
    Querystring: {
      bbox: string;
      limit?: number;
    };
  }>(
    "/api/transit/transitland/vehicles",
    {
      schema: {
        description:
          "Get Transitland real-time vehicles within a bounding box. Fetches GTFS_RT feeds and combines them.",
        tags: ["Transitland"],
        querystring: {
          type: "object",
          properties: {
            bbox: { type: "string" },
            limit: { type: "number", default: 5 }, // max feeds to poll
          },
          required: ["bbox"],
        },
      },
    },
    async (req) => {
      const { bbox, limit } = req.query;

      try {
        // 1. Find operators in this bbox
        const operatorsData = await fetchTransitland<TransitlandOperatorsResponse>(
          "/operators",
          {
            bbox,
            limit: limit ?? 50,
          },
        );

        if (!operatorsData?.operators) {
          return { vehicles: [] };
        }

        // 2. Extract GTFS_RT feeds from these operators
        const rtFeeds = operatorsData.operators.flatMap(
          (op) => op.feeds?.filter((f) => f.spec === "GTFS_RT") ?? [],
        );

        if (rtFeeds.length === 0) {
          return { vehicles: [] };
        }
        
        // 2. For each feed, fetch the latest vehicle positions
        const vehiclePromises = rtFeeds.map(async (feed) => {
          try {
            const feedData = await fetchTransitland<GTFSRTFeed>(
              `/feeds/${feed.onestop_id}/download_latest_rt/vehicle_positions.json`,
              {},
            );
            if (!feedData) return [];
            return transferTransitlandVehicles(feedData);
          } catch (err) {
            app.log.error(err, "Failed to fetch vehicle_positions for feed");
            return [];
          }
        });

        const allVehiclesArrays = await Promise.all(vehiclePromises);
        const allVehicles = allVehiclesArrays.flat();

        return { vehicles: allVehicles };
      } catch (err) {
        app.log.error(err, "Failed to fetch vehicles");
        return { vehicles: [] };
      }
    },
  );

  app.get<{ Params: { routeId: string } }>(
    "/api/transit/transitland/route-shapes/:routeId",
    {
      schema: {
        description: "Get route shapes for a given route ID",
        tags: ["Transitland"],
        params: {
          type: "object",
          properties: {
            routeId: { type: "string" },
          },
        },
      },
    },
    async (req) => {
      const { routeId } = req.params;

      try {
        const data = await fetchTransitland<TransitlandRoutesGeoJSONResponse>(
          `/routes.geojson`,
          { route_id: routeId }
        );

        if (!data || data.features.length === 0) {
          return { shapes: [] };
        }

        const shapes: RouteShape[] = [];

        for (const feature of data.features) {
          if (!feature.geometry) continue;
          
          const geomType = feature.geometry.type;
          const coords = feature.geometry.coordinates;

          if (geomType === "LineString") {
            shapes.push({
              shapeId: `${routeId}_${shapes.length}`,
              routeId,
              points: coords as [number, number][],
            });
          } else if (geomType === "MultiLineString") {
            const multi = coords as [number, number][][];
            multi.forEach((line) => {
              shapes.push({
                shapeId: `${routeId}_${shapes.length}`,
                routeId,
                points: line,
              });
            });
          }
        }

        return { shapes };
      } catch (err) {
        app.log.error(err, "Failed to fetch route shapes");
        return { shapes: [] };
      }
    },
  );
};
