import { z } from "zod/v4";

import { scopedIdSchema } from "@/lib/schemas";

export {
  mapRouteShapeQuerySchema,
  mapRoutesQuerySchema,
  mapStopsQuerySchema,
  mapTripsQuerySchema,
  mapVehiclesQuerySchema,
  staticFeedsStatusQuerySchema,
} from "@/controllers/map/schema";
export { departuresQuerySchema } from "@/controllers/stops/schema";

export const providerParamsSchema = z.object({
  provider: z.enum(["transit", "simulator"]),
});

export const providerStopParamsSchema = z.object({
  provider: z.enum(["transit", "simulator"]),
  stopId: scopedIdSchema,
});
