import type { FastifyPluginAsync } from "fastify";

import { bkkShapesPlugin } from "@/providers/bkk/shapes";
import { bkkVehiclesPlugin } from "@/providers/bkk/vehicles";

export const bkkProviderPlugin: FastifyPluginAsync = async (app) => {
  await app.register(bkkVehiclesPlugin);
  await app.register(bkkShapesPlugin);
};
