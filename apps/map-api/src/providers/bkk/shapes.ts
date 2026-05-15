import type { FastifyPluginAsync } from "fastify";

import type { RouteDetailsMethodResponse } from "@/providers/bkk/api";
import { fetchBKK } from "@/providers/bkk/client";
import { transferRouteDetailsToShapes } from "@/providers/bkk/data-transfer";
import type { RouteShape } from "@/providers/types";

const shapesCache = new Map<string, { data: RouteShape[]; ts: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000;

// eslint-disable-next-line @typescript-eslint/require-await
export const bkkShapesPlugin: FastifyPluginAsync = async (app) => {
  app.get<{ Params: { routeId: string } }>(
    "/api/transit/shapes/:routeId",
    async (req) => {
      const { routeId } = req.params;

      const cached = shapesCache.get(routeId);
      if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
        return cached.data;
      }

      try {
        const json = await fetchBKK<RouteDetailsMethodResponse>(
          "/route-details",
          {
            routeId,
            includeReferences: false,
          },
        );

        if (!json) {
          app.log.error(`FUTAR route-details returned null for ${routeId}`);
          return [];
        }

        const variants = json.data.entry.variants ?? [];

        const shapes = transferRouteDetailsToShapes(routeId, variants);

        shapesCache.set(routeId, { data: shapes, ts: Date.now() });

        return shapes;
      } catch (err) {
        app.log.error(err, `Failed to fetch route-details for ${routeId}`);
        return [];
      }
    },
  );
};
