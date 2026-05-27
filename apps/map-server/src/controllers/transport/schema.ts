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
  provider: z.string().min(1),
});

export const providerStopParamsSchema = z.object({
  provider: z.string().min(1),
  stopId: scopedIdSchema,
});
