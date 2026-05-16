import { useQuery } from "@tanstack/react-query";

import { mapApiClient } from "@/lib/api-client";

export interface RouteShape {
  shapeId: string;
  routeId: string;
  points: [number, number][];
}

export function useRouteShapes(
  routeId: string | null,
  operatorOnestopId?: string,
) {
  return useQuery<RouteShape[]>({
    queryKey: ["transitland", "shapes", routeId, operatorOnestopId],
    queryFn: async () => {
      if (!routeId) return [];
      const { data, error } = await mapApiClient<{ shapes: RouteShape[] }>(
        `/transitland/route-shapes/${routeId}`,
        {
          query: operatorOnestopId ? { operatorId: operatorOnestopId } : {},
        },
      );
      if (error) return [];
      return data.shapes;
    },
    enabled: !!routeId,
    staleTime: 5 * 60 * 1000,
  });
}
